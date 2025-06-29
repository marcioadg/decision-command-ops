
import { useEffect, useState, useCallback, useRef } from 'react';
import { Decision } from '@/types/Decision';
import { supabase } from '@/integrations/supabase/client';
import { convertDatabaseRecordToDecision } from './decisionRealtimeUtils';

interface UseDecisionRealtimeProps {
  user: any;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useDecisionRealtime = ({ user, setDecisions }: UseDecisionRealtimeProps) => {
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [pausedDecisionIds, setPausedDecisionIds] = useState<Set<string>>(new Set());
  
  // Use refs to avoid triggering re-renders and circular dependencies
  const connectionAttemptsRef = useRef(0);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const circuitBreakerRef = useRef(false);
  const lastConnectionAttemptRef = useRef(0);
  const connectionHealthRef = useRef(true);

  const pauseRealtimeForDecision = useCallback((decisionId: string, duration = 2000) => {
    console.log(`Pausing real-time updates for decision ${decisionId} for ${duration}ms`);
    setPausedDecisionIds(prev => new Set(prev).add(decisionId));
    
    setTimeout(() => {
      console.log(`Resuming real-time updates for decision ${decisionId}`);
      setPausedDecisionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(decisionId);
        return newSet;
      });
    }, duration);
  }, []);

  const cleanupConnection = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up existing real-time connection');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    isConnectingRef.current = false;
    setIsRealTimeConnected(false);
  }, []);

  const setupRealtimeConnection = useCallback(() => {
    // Circuit breaker: stop if too many failures
    if (circuitBreakerRef.current) {
      console.log('Circuit breaker active - not attempting connection');
      return;
    }

    if (!user?.id) {
      console.log('No user available for real-time connection');
      setIsRealTimeConnected(false);
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress');
      return;
    }

    // Debounce connection attempts (min 500ms between attempts)
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < 500) {
      console.log('Connection attempt too soon, debouncing');
      return;
    }
    lastConnectionAttemptRef.current = now;

    // Clean up any existing connection
    cleanupConnection();
    isConnectingRef.current = true;

    console.log(`Setting up real-time subscription for user ${user.id} (attempt ${connectionAttemptsRef.current + 1})`);
    
    const channel = supabase
      .channel(`decisions-changes-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'decisions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time decision change received:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          // Check if updates are paused for this decision
          const recordId = (newRecord && typeof newRecord === 'object' && 'id' in newRecord) 
            ? newRecord.id 
            : (oldRecord && typeof oldRecord === 'object' && 'id' in oldRecord) 
              ? oldRecord.id 
              : null;
              
          if (recordId && pausedDecisionIds.has(recordId)) {
            console.log(`Ignoring real-time update for paused decision ${recordId}`);
            return;
          }
          
          // Mark connection as healthy when receiving data
          connectionHealthRef.current = true;
          
          setDecisions(prev => {
            switch (eventType) {
              case 'INSERT':
                if (newRecord && typeof newRecord === 'object' && 'id' in newRecord) {
                  const newDecision = convertDatabaseRecordToDecision(newRecord);
                  const exists = prev.some(d => d.id === newDecision.id);
                  if (!exists) {
                    console.log('Adding new decision from real-time:', newDecision.id);
                    return [newDecision, ...prev];
                  }
                }
                return prev;
                
              case 'UPDATE':
                if (newRecord && typeof newRecord === 'object' && 'id' in newRecord) {
                  console.log('Updating decision from real-time:', newRecord.id);
                  return prev.map(decision => {
                    if (decision.id === newRecord.id) {
                      const updatedDecision = convertDatabaseRecordToDecision(newRecord);
                      console.log('Real-time update applied:', {
                        old: decision.stage,
                        new: updatedDecision.stage
                      });
                      return updatedDecision;
                    }
                    return decision;
                  });
                }
                return prev;
                
              case 'DELETE':
                if (oldRecord && typeof oldRecord === 'object' && 'id' in oldRecord) {
                  console.log('Removing decision from real-time:', oldRecord.id);
                  return prev.filter(decision => decision.id !== oldRecord.id);
                }
                return prev;
                
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status, 'for user:', user.id);
        isConnectingRef.current = false;
        
        switch (status) {
          case 'SUBSCRIBED':
            console.log('Real-time connection established successfully');
            setIsRealTimeConnected(true);
            connectionAttemptsRef.current = 0;
            circuitBreakerRef.current = false;
            connectionHealthRef.current = true;
            break;
            
          case 'CHANNEL_ERROR':
            console.error('Real-time connection channel_error - will attempt reconnection');
            setIsRealTimeConnected(false);
            connectionHealthRef.current = false;
            scheduleReconnection();
            break;
            
          case 'TIMED_OUT':
            console.error('Real-time connection timed_out - will attempt reconnection');
            setIsRealTimeConnected(false);
            connectionHealthRef.current = false;
            scheduleReconnection();
            break;
            
          case 'CLOSED':
            console.log('Real-time connection closed');
            setIsRealTimeConnected(false);
            // Don't automatically reconnect on CLOSED - it might be intentional
            break;
            
          default:
            console.log('Real-time connection status:', status);
            setIsRealTimeConnected(false);
        }
      });

    channelRef.current = channel;
  }, [user?.id, cleanupConnection]); // Stable dependencies

  const scheduleReconnection = useCallback(() => {
    connectionAttemptsRef.current += 1;
    
    if (connectionAttemptsRef.current >= 5) {
      console.log('Max connection attempts reached, activating circuit breaker');
      circuitBreakerRef.current = true;
      setIsRealTimeConnected(false);
      return;
    }

    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, connectionAttemptsRef.current - 1);
    const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
    const delay = Math.min(baseDelay + jitter, 30000);
    
    console.log(`Scheduling real-time reconnection in ${Math.round(delay)}ms (attempt ${connectionAttemptsRef.current}/5)`);
    
    // Clear any existing timeout to prevent multiple schedules
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      setupRealtimeConnection();
    }, delay);
  }, [setupRealtimeConnection]);

  const retryConnection = useCallback(() => {
    console.log('Manual retry of real-time connection requested');
    connectionAttemptsRef.current = 0;
    circuitBreakerRef.current = false;
    connectionHealthRef.current = true;
    cleanupConnection();
    
    // Add small delay to prevent immediate retry loops
    setTimeout(() => {
      setupRealtimeConnection();
    }, 100);
  }, [setupRealtimeConnection, cleanupConnection]);

  // Initial setup - only depend on user ID to avoid circular dependencies
  useEffect(() => {
    if (user?.id) {
      setupRealtimeConnection();
    } else {
      cleanupConnection();
    }
    
    return () => {
      console.log('Cleaning up real-time subscription');
      cleanupConnection();
    };
  }, [user?.id]); // CRITICAL: Only depend on user.id

  // Health check - periodically verify connection is working
  useEffect(() => {
    if (!isRealTimeConnected) return;

    const healthCheckInterval = setInterval(() => {
      if (!connectionHealthRef.current && isRealTimeConnected) {
        console.log('Real-time connection appears unhealthy, triggering reconnection');
        retryConnection();
      }
      // Reset health flag - it will be set to true when we receive data
      connectionHealthRef.current = false;
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isRealTimeConnected, retryConnection]);

  return { 
    isRealTimeConnected,
    pauseRealtimeForDecision,
    retryConnection
  };
};


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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  }, []);

  const setupRealtimeConnection = useCallback(() => {
    if (!user) {
      console.log('No user available for real-time connection');
      setIsRealTimeConnected(false);
      return;
    }

    // Clean up any existing connection
    cleanupConnection();

    console.log(`Setting up real-time subscription for user ${user.id} (attempt ${connectionAttempts + 1})`);
    
    const channel = supabase
      .channel(`decisions-changes-${user.id}-${Date.now()}`) // Unique channel name to avoid conflicts
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
        
        switch (status) {
          case 'SUBSCRIBED':
            console.log('Real-time connection established successfully');
            setIsRealTimeConnected(true);
            setConnectionAttempts(0);
            break;
            
          case 'CHANNEL_ERROR':
            console.error('Real-time channel error - will attempt reconnection');
            setIsRealTimeConnected(false);
            scheduleReconnection();
            break;
            
          case 'TIMED_OUT':
            console.error('Real-time connection timed out - will attempt reconnection');
            setIsRealTimeConnected(false);
            scheduleReconnection();
            break;
            
          case 'CLOSED':
            console.log('Real-time connection closed');
            setIsRealTimeConnected(false);
            break;
            
          default:
            console.log('Real-time connection status:', status);
            setIsRealTimeConnected(false);
        }
      });

    channelRef.current = channel;
  }, [user, setDecisions, pausedDecisionIds, connectionAttempts, cleanupConnection]);

  const scheduleReconnection = useCallback(() => {
    if (connectionAttempts >= 5) {
      console.log('Max connection attempts reached, giving up on real-time');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Exponential backoff, max 30s
    console.log(`Scheduling real-time reconnection in ${delay}ms (attempt ${connectionAttempts + 1}/5)`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionAttempts(prev => prev + 1);
      setupRealtimeConnection();
    }, delay);
  }, [connectionAttempts, setupRealtimeConnection]);

  const retryConnection = useCallback(() => {
    console.log('Manual retry of real-time connection requested');
    setConnectionAttempts(0);
    setupRealtimeConnection();
  }, [setupRealtimeConnection]);

  // Initial setup and cleanup
  useEffect(() => {
    setupRealtimeConnection();
    
    return () => {
      console.log('Cleaning up real-time subscription');
      cleanupConnection();
      setIsRealTimeConnected(false);
    };
  }, [user?.id]); // Only depend on user ID to avoid unnecessary reconnections

  return { 
    isRealTimeConnected,
    pauseRealtimeForDecision,
    retryConnection
  };
};

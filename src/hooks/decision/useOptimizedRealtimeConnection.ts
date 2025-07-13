import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedRealtimeConnectionProps {
  userId: string | undefined;
  onMessage: (payload: any) => void;
}

// Connection pool to prevent too many simultaneous connections
const activeConnections = new Set<string>();
const MAX_CONNECTIONS = 5;

export const useOptimizedRealtimeConnection = ({ userId, onMessage }: UseOptimizedRealtimeConnectionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const isConnectingRef = useRef(false);
  const lastConnectionAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (channelRef.current && isConnected) {
        try {
          // Send a lightweight ping
          channelRef.current.send({ type: 'ping', timestamp: Date.now() });
        } catch (error) {
          console.warn('Heartbeat failed, attempting reconnection:', error);
          setupConnection();
        }
      }
    }, 30000); // 30 seconds
  }, [isConnected]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const cleanupConnection = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up optimized real-time connection');
      try {
        supabase.removeChannel(channelRef.current);
        if (userId) {
          activeConnections.delete(userId);
        }
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      channelRef.current = null;
    }
    
    isConnectingRef.current = false;
    stopHeartbeat();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      setIsConnected(false);
    }
  }, [userId, stopHeartbeat]);

  const setupConnection = useCallback(() => {
    if (!userId) {
      console.log('No user available for real-time connection');
      if (isMountedRef.current) {
        setIsConnected(false);
      }
      return;
    }

    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress');
      return;
    }

    // Check connection pool limit
    if (activeConnections.size >= MAX_CONNECTIONS && !activeConnections.has(userId)) {
      console.log('Connection pool limit reached, queuing connection');
      reconnectTimeoutRef.current = setTimeout(() => setupConnection(), 2000);
      return;
    }

    // Enhanced debouncing with exponential backoff
    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    const minInterval = Math.min(500 * Math.pow(1.5, Math.max(0, activeConnections.size - 1)), 5000);
    
    if (timeSinceLastAttempt < minInterval) {
      console.log(`Connection attempt too soon, waiting ${minInterval - timeSinceLastAttempt}ms`);
      reconnectTimeoutRef.current = setTimeout(() => setupConnection(), minInterval - timeSinceLastAttempt);
      return;
    }
    
    lastConnectionAttemptRef.current = now;

    cleanupConnection();
    
    // Check if component is still mounted before proceeding
    if (!isMountedRef.current) {
      return;
    }
    
    isConnectingRef.current = true;
    activeConnections.add(userId);

    console.log(`Setting up optimized real-time subscription for user ${userId}`);
    
    try {
      const channel = supabase
        .channel(`decisions-optimized-${userId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'decisions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Check if component is still mounted before calling onMessage
            if (isMountedRef.current) {
              // Debounce rapid-fire updates
              const messageHandler = () => onMessage(payload);
              
              // Use requestAnimationFrame for better performance
              requestAnimationFrame(messageHandler);
            }
          }
        )
        .subscribe((status) => {
          console.log('Optimized real-time subscription status:', status, 'for user:', userId);
          isConnectingRef.current = false;
          
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            const wasConnected = isConnected;
            const nowConnected = status === 'SUBSCRIBED';
            setIsConnected(nowConnected);
            
            if (nowConnected && !wasConnected) {
              console.log('Real-time connection established successfully');
              startHeartbeat();
            } else if (!nowConnected && wasConnected) {
              console.log('Real-time connection lost, will attempt reconnection');
              stopHeartbeat();
              // Auto-reconnect after a delay
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  setupConnection();
                }
              }, 3000);
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up optimized real-time connection:', error);
      isConnectingRef.current = false;
      activeConnections.delete(userId);
      
      if (isMountedRef.current) {
        setIsConnected(false);
        // Retry after a delay
        reconnectTimeoutRef.current = setTimeout(() => setupConnection(), 5000);
      }
    }
  }, [userId, onMessage, cleanupConnection, isConnected, startHeartbeat, stopHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection]);

  return {
    isConnected,
    setupConnection,
    cleanupConnection
  };
};


import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeConnectionProps {
  userId: string | undefined;
  onMessage: (payload: any) => void;
}

export const useRealtimeConnection = ({ userId, onMessage }: UseRealtimeConnectionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const isConnectingRef = useRef(false);
  const lastConnectionAttemptRef = useRef(0);
  const isMountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cleanupConnection = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up existing real-time connection');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      channelRef.current = null;
    }
    isConnectingRef.current = false;
    
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      setIsConnected(false);
    }
  }, []);

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

    // Debounce connection attempts (min 500ms between attempts)
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < 500) {
      console.log('Connection attempt too soon, debouncing');
      return;
    }
    lastConnectionAttemptRef.current = now;

    cleanupConnection();
    
    // Check if component is still mounted before proceeding
    if (!isMountedRef.current) {
      return;
    }
    
    isConnectingRef.current = true;

    console.log(`Setting up real-time subscription for user ${userId}`);
    
    try {
      const channel = supabase
        .channel(`decisions-changes-${userId}-${Date.now()}`)
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
              onMessage(payload);
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status, 'for user:', userId);
          isConnectingRef.current = false;
          
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setIsConnected(status === 'SUBSCRIBED');
            
            if (status === 'SUBSCRIBED') {
              console.log('Real-time connection established successfully');
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time connection:', error);
      isConnectingRef.current = false;
      if (isMountedRef.current) {
        setIsConnected(false);
      }
    }
  }, [userId, onMessage, cleanupConnection]);

  return {
    isConnected,
    setupConnection,
    cleanupConnection
  };
};

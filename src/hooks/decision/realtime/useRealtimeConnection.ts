
import { useState, useRef, useCallback } from 'react';
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

  const cleanupConnection = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up existing real-time connection');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  const setupConnection = useCallback(() => {
    if (!userId) {
      console.log('No user available for real-time connection');
      setIsConnected(false);
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
    isConnectingRef.current = true;

    console.log(`Setting up real-time subscription for user ${userId}`);
    
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
        onMessage
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status, 'for user:', userId);
        isConnectingRef.current = false;
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('Real-time connection established successfully');
        }
      });

    channelRef.current = channel;
  }, [userId, onMessage, cleanupConnection]);

  return {
    isConnected,
    setupConnection,
    cleanupConnection
  };
};

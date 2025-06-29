
import { useEffect, useState } from 'react';
import { Decision } from '@/types/Decision';
import { useRealtimeConnection } from './realtime/useRealtimeConnection';
import { useRealtimeReconnection } from './realtime/useRealtimeReconnection';
import { useRealtimeMessageHandler } from './realtime/useRealtimeMessageHandler';

interface UseDecisionRealtimeProps {
  user: any;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useDecisionRealtime = ({ user, setDecisions }: UseDecisionRealtimeProps) => {
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Set up message handling
  const { handleMessage, pauseRealtimeForDecision } = useRealtimeMessageHandler({ setDecisions });

  // Set up reconnection logic
  const { 
    scheduleReconnection, 
    retryConnection: baseRetryConnection, 
    resetAttempts, 
    cleanup: cleanupReconnection,
    isCircuitBreakerActive 
  } = useRealtimeReconnection();

  // Set up connection management
  const { isConnected, setupConnection, cleanupConnection } = useRealtimeConnection({
    userId: user?.id,
    onMessage: handleMessage
  });

  // Update connected state
  useEffect(() => {
    setIsRealTimeConnected(isConnected);
    if (isConnected) {
      resetAttempts();
    }
  }, [isConnected, resetAttempts]);

  const retryConnection = () => {
    if (isCircuitBreakerActive()) {
      console.log('Circuit breaker active - not attempting connection');
      return;
    }
    baseRetryConnection(setupConnection);
  };

  // Initial setup
  useEffect(() => {
    if (user?.id) {
      setupConnection();
    } else {
      cleanupConnection();
    }
    
    return () => {
      console.log('Cleaning up real-time subscription');
      cleanupConnection();
      cleanupReconnection();
    };
  }, [user?.id, setupConnection, cleanupConnection, cleanupReconnection]);

  return { 
    isRealTimeConnected,
    pauseRealtimeForDecision,
    retryConnection
  };
};

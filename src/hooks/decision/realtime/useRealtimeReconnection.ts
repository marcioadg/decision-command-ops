
import { useRef, useCallback } from 'react';

export const useRealtimeReconnection = () => {
  const connectionAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const circuitBreakerRef = useRef(false);

  const scheduleReconnection = useCallback((setupConnection: () => void) => {
    connectionAttemptsRef.current += 1;
    
    if (connectionAttemptsRef.current >= 5) {
      console.log('Max connection attempts reached, activating circuit breaker');
      circuitBreakerRef.current = true;
      return;
    }

    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, connectionAttemptsRef.current - 1);
    const jitter = Math.random() * 1000;
    const delay = Math.min(baseDelay + jitter, 30000);
    
    console.log(`Scheduling real-time reconnection in ${Math.round(delay)}ms (attempt ${connectionAttemptsRef.current}/5)`);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      setupConnection();
    }, delay);
  }, []);

  const retryConnection = useCallback((setupConnection: () => void) => {
    console.log('Manual retry of real-time connection requested');
    connectionAttemptsRef.current = 0;
    circuitBreakerRef.current = false;
    
    setTimeout(() => {
      setupConnection();
    }, 100);
  }, []);

  const resetAttempts = useCallback(() => {
    connectionAttemptsRef.current = 0;
    circuitBreakerRef.current = false;
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  return {
    scheduleReconnection,
    retryConnection,
    resetAttempts,
    cleanup,
    isCircuitBreakerActive: () => circuitBreakerRef.current
  };
};

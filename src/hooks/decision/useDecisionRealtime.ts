
import { useEffect, useState, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [reconnectTimer, setReconnectTimer] = useState<NodeJS.Timeout | null>(null);

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

  const attemptReconnection = useCallback(() => {
    if (retryCount >= 5) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    console.log(`Attempting real-time reconnection in ${delay}ms (attempt ${retryCount + 1}/5)`);
    
    const timer = setTimeout(() => {
      setRetryCount(prev => prev + 1);
    }, delay);
    
    setReconnectTimer(timer);
  }, [retryCount]);

  useEffect(() => {
    if (!user) {
      setIsRealTimeConnected(false);
      return;
    }

    console.log('Setting up real-time subscription for decisions');
    
    const channel = supabase
      .channel(`decisions-changes-${user.id}`)
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
                        old: decision.preAnalysis,
                        new: updatedDecision.preAnalysis
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
        console.log('Real-time subscription status:', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            setIsRealTimeConnected(true);
            setRetryCount(0);
            if (reconnectTimer) {
              clearTimeout(reconnectTimer);
              setReconnectTimer(null);
            }
            break;
            
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            console.error('Real-time connection issue:', status);
            setIsRealTimeConnected(false);
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              attemptReconnection();
            }
            break;
            
          default:
            setIsRealTimeConnected(false);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      supabase.removeChannel(channel);
      setIsRealTimeConnected(false);
    };
  }, [user, setDecisions, pausedDecisionIds, attemptReconnection, reconnectTimer]);

  return { 
    isRealTimeConnected,
    pauseRealtimeForDecision
  };
};

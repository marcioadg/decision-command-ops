
import { useEffect, useState } from 'react';
import { Decision } from '@/types/Decision';
import { supabase } from '@/integrations/supabase/client';
import { convertDatabaseRecordToDecision } from './decisionRealtimeUtils';

interface UseDecisionRealtimeProps {
  user: any;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useDecisionRealtime = ({ user, setDecisions }: UseDecisionRealtimeProps) => {
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for decisions');
    
    const channel = supabase
      .channel('decisions-changes')
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
          
          setDecisions(prev => {
            switch (eventType) {
              case 'INSERT':
                if (newRecord) {
                  const newDecision = convertDatabaseRecordToDecision(newRecord);
                  const exists = prev.some(d => d.id === newDecision.id);
                  if (!exists) {
                    console.log('Adding new decision from real-time:', newDecision.id);
                    return [newDecision, ...prev];
                  }
                }
                return prev;
                
              case 'UPDATE':
                if (newRecord) {
                  console.log('Updating decision from real-time:', newRecord.id);
                  return prev.map(decision => {
                    if (decision.id === newRecord.id) {
                      return convertDatabaseRecordToDecision(newRecord);
                    }
                    return decision;
                  });
                }
                return prev;
                
              case 'DELETE':
                if (oldRecord) {
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
        setIsRealTimeConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          console.error('Real-time channel error');
          setIsRealTimeConnected(false);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setIsRealTimeConnected(false);
    };
  }, [user, setDecisions]);

  return { isRealTimeConnected };
};

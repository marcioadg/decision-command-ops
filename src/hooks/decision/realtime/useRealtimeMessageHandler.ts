
import { useCallback, useState } from 'react';
import { Decision } from '@/types/Decision';
import { convertDatabaseRecordToDecision } from '../decisionRealtimeUtils';

interface UseRealtimeMessageHandlerProps {
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useRealtimeMessageHandler = ({ setDecisions }: UseRealtimeMessageHandlerProps) => {
  const [pausedDecisionIds, setPausedDecisionIds] = useState<Set<string>>(new Set());

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

  const handleMessage = useCallback((payload: any) => {
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
  }, [setDecisions, pausedDecisionIds]);

  return {
    handleMessage,
    pauseRealtimeForDecision
  };
};

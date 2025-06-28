
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';

interface UseImmediateDecisionSyncProps {
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useImmediateDecisionSync = ({ setDecisions }: UseImmediateDecisionSyncProps) => {
  const applyImmediateUpdate = useCallback((updatedDecision: Decision) => {
    console.log('useImmediateDecisionSync: Applying immediate update for decision:', updatedDecision.id);
    
    setDecisions(prev => {
      const updated = prev.map(decision => {
        if (decision.id === updatedDecision.id) {
          // Ensure we're using the most recent timestamp for this immediate update
          const immediateUpdate = {
            ...updatedDecision,
            updatedAt: new Date() // Force current timestamp for immediate updates
          };
          
          console.log('useImmediateDecisionSync: Updated decision with timestamp:', {
            id: immediateUpdate.id,
            updatedAt: immediateUpdate.updatedAt
          });
          
          return immediateUpdate;
        }
        return decision;
      });
      
      console.log('useImmediateDecisionSync: Decision list updated with immediate change');
      return updated;
    });
  }, [setDecisions]);

  return {
    applyImmediateUpdate
  };
};

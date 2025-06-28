
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';

interface UseImmediateDecisionSyncProps {
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useImmediateDecisionSync = ({ setDecisions }: UseImmediateDecisionSyncProps) => {
  const applyImmediateUpdate = useCallback((updatedDecision: Decision) => {
    console.log('useImmediateDecisionSync: Applying immediate update for decision:', updatedDecision.id);
    
    setDecisions(prev => {
      const updated = prev.map(decision => 
        decision.id === updatedDecision.id ? updatedDecision : decision
      );
      
      console.log('useImmediateDecisionSync: Decision list updated with immediate change');
      return updated;
    });
  }, [setDecisions]);

  return {
    applyImmediateUpdate
  };
};

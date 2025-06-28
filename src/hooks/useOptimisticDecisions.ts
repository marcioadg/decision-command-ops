
import { useState, useCallback, useEffect } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';

interface OptimisticUpdate {
  id: string;
  originalStage: DecisionStage;
  newStage: DecisionStage;
  timestamp: number;
}

export const useOptimisticDecisions = (decisions: Decision[]) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);

  // Clean up old optimistic updates after they're confirmed by the server
  useEffect(() => {
    const now = Date.now();
    setOptimisticUpdates(prev => prev.filter(update => now - update.timestamp < 5000)); // Clean up after 5 seconds
  }, [decisions]);

  const applyOptimisticUpdate = useCallback((decisionId: string, newStage: DecisionStage) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) return;

    setOptimisticUpdates(prev => {
      // Remove any existing update for this decision
      const filtered = prev.filter(update => update.id !== decisionId);
      // Add new optimistic update
      return [...filtered, {
        id: decisionId,
        originalStage: decision.stage,
        newStage,
        timestamp: Date.now()
      }];
    });
  }, [decisions]);

  const removeOptimisticUpdate = useCallback((decisionId: string) => {
    setOptimisticUpdates(prev => prev.filter(update => update.id !== decisionId));
  }, []);

  const rollbackOptimisticUpdate = useCallback((decisionId: string) => {
    setOptimisticUpdates(prev => prev.filter(update => update.id !== decisionId));
  }, []);

  // Apply optimistic updates to the decisions
  const optimisticDecisions = decisions.map(decision => {
    const optimisticUpdate = optimisticUpdates.find(update => update.id === decision.id);
    if (optimisticUpdate) {
      return {
        ...decision,
        stage: optimisticUpdate.newStage,
        updatedAt: new Date() // Update timestamp for visual feedback
      };
    }
    return decision;
  });

  return {
    optimisticDecisions,
    applyOptimisticUpdate,
    removeOptimisticUpdate,
    rollbackOptimisticUpdate,
    hasOptimisticUpdate: (decisionId: string) => optimisticUpdates.some(update => update.id === decisionId)
  };
};

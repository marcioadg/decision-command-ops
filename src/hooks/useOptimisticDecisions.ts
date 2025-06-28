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

  // Clean up optimistic updates when server state confirms the change
  // FIXED: Removed optimisticUpdates from dependency array to prevent infinite loop
  useEffect(() => {
    console.log('useOptimisticDecisions: Checking for confirmed updates', {
      decisions: decisions.length
    });

    setOptimisticUpdates(prevUpdates => {
      if (prevUpdates.length === 0) return prevUpdates;

      const remaining = prevUpdates.filter(update => {
        const decision = decisions.find(d => d.id === update.id);
        if (!decision) {
          console.log('useOptimisticDecisions: Decision not found, keeping optimistic update:', update.id);
          return true;
        }

        // Check if server state matches our optimistic state
        const serverStateMatches = decision.stage === update.newStage;
        
        if (serverStateMatches) {
          console.log('useOptimisticDecisions: Server state matches optimistic state, removing update:', {
            decisionId: update.id,
            optimisticStage: update.newStage,
            serverStage: decision.stage
          });
          return false; // Remove this optimistic update
        }

        // Keep update if server hasn't caught up yet, but with timeout
        const updateAge = Date.now() - update.timestamp;
        if (updateAge > 10000) { // 10 seconds timeout
          console.log('useOptimisticDecisions: Timing out old optimistic update:', update.id);
          return false;
        }

        return true;
      });

      // Only update state if there's actually a change
      if (remaining.length !== prevUpdates.length) {
        console.log('useOptimisticDecisions: Updated optimistic updates count:', remaining.length);
        return remaining;
      }
      
      return prevUpdates;
    });
  }, [decisions]); // Only depend on decisions, not optimisticUpdates

  // Clean up old optimistic updates after timeout (fallback)
  useEffect(() => {
    const cleanup = () => {
      setOptimisticUpdates(prevUpdates => {
        const now = Date.now();
        const remaining = prevUpdates.filter(update => {
          const isOld = now - update.timestamp > 12000; // 12 seconds timeout
          if (isOld) {
            console.log('useOptimisticDecisions: Timing out old optimistic update:', update.id);
          }
          return !isOld;
        });
        
        // Only update if there's a change
        return remaining.length !== prevUpdates.length ? remaining : prevUpdates;
      });
    };

    const interval = setInterval(cleanup, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []); // No dependencies needed for this cleanup

  const applyOptimisticUpdate = useCallback((decisionId: string, newStage: DecisionStage) => {
    const decision = decisions.find(d => d.id === decisionId);
    if (!decision) {
      console.log('useOptimisticDecisions: Decision not found for optimistic update:', decisionId);
      return;
    }

    console.log('useOptimisticDecisions: Applying optimistic update:', {
      decisionId,
      originalStage: decision.stage,
      newStage,
      timestamp: Date.now()
    });

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
    console.log('useOptimisticDecisions: Manually removing optimistic update:', decisionId);
    setOptimisticUpdates(prev => prev.filter(update => update.id !== decisionId));
  }, []);

  const rollbackOptimisticUpdate = useCallback((decisionId: string) => {
    console.log('useOptimisticDecisions: Rolling back optimistic update:', decisionId);
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

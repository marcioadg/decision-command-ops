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
  useEffect(() => {
    console.log('useOptimisticDecisions: Checking for confirmed updates', {
      optimisticUpdates: optimisticUpdates.length,
      decisions: decisions.length
    });

    setOptimisticUpdates(prev => {
      const remaining = prev.filter(update => {
        const decision = decisions.find(d => d.id === update.id);
        if (!decision) {
          console.log('useOptimisticDecisions: Decision not found, keeping optimistic update:', update.id);
          return true;
        }

        // Check if server state matches our optimistic state
        const serverStateMatches = decision.stage === update.newStage;
        
        // With real-time updates, we can be more aggressive about cleanup
        // If the server state matches and the decision has been updated recently, remove optimistic update
        const isRecentUpdate = decision.updatedAt && 
          (Date.now() - decision.updatedAt.getTime()) < 30000; // 30 seconds window

        if (serverStateMatches) {
          console.log('useOptimisticDecisions: Server state matches optimistic state, removing update:', {
            decisionId: update.id,
            optimisticStage: update.newStage,
            serverStage: decision.stage,
            serverUpdatedAt: decision.updatedAt,
            isRecentUpdate
          });
          return false; // Remove this optimistic update
        }

        // Keep update if server hasn't caught up yet, but with shorter timeout due to real-time
        const updateAge = Date.now() - update.timestamp;
        if (updateAge > 10000) { // 10 seconds timeout (reduced from 15)
          console.log('useOptimisticDecisions: Timing out old optimistic update:', update.id);
          return false;
        }

        console.log('useOptimisticDecisions: Keeping optimistic update:', {
          decisionId: update.id,
          optimisticStage: update.newStage,
          serverStage: decision.stage,
          updateAge: updateAge + 'ms'
        });
        return true;
      });

      return remaining;
    });
  }, [decisions, optimisticUpdates]);

  // Clean up old optimistic updates after timeout (fallback) - reduced frequency due to real-time
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setOptimisticUpdates(prev => {
        const remaining = prev.filter(update => {
          const isOld = now - update.timestamp > 12000; // 12 seconds timeout (reduced from 15)
          if (isOld) {
            console.log('useOptimisticDecisions: Timing out old optimistic update:', update.id);
          }
          return !isOld;
        });
        return remaining;
      });
    };

    const interval = setInterval(cleanup, 3000); // Check every 3 seconds (increased from 5)
    return () => clearInterval(interval);
  }, []);

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
      console.log('useOptimisticDecisions: Applying optimistic state to decision:', {
        decisionId: decision.id,
        originalStage: decision.stage,
        optimisticStage: optimisticUpdate.newStage
      });
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

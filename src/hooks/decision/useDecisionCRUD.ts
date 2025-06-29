
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useToast } from '@/hooks/use-toast';

interface UseDecisionCRUDProps {
  isRealTimeConnected: boolean;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
  pauseRealtimeForDecision?: (decisionId: string, duration?: number) => void;
  onImmediateUpdate?: (decision: Decision) => void;
}

export const useDecisionCRUD = ({ 
  isRealTimeConnected, 
  setDecisions, 
  pauseRealtimeForDecision,
  onImmediateUpdate 
}: UseDecisionCRUDProps) => {
  const { toast } = useToast();

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating decision:', decision.title);
      
      // Create optimistic decision for immediate UI update
      const optimisticDecision: Decision = {
        ...decision,
        id: `temp-${Date.now()}`, // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Apply immediate update for optimistic UI
      if (onImmediateUpdate) {
        console.log('Applying immediate optimistic update for new decision');
        onImmediateUpdate(optimisticDecision);
      }

      // If not connected to real-time, update local state immediately
      if (!isRealTimeConnected) {
        setDecisions(prev => [optimisticDecision, ...prev]);
      }
      
      const newDecision = await decisionService.createDecision(decision);
      
      // Replace optimistic decision with real one
      if (onImmediateUpdate) {
        console.log('Replacing optimistic decision with real decision');
        onImmediateUpdate(newDecision);
      }

      // Update local state with real decision if not using real-time
      if (!isRealTimeConnected) {
        setDecisions(prev => prev.map(d => 
          d.id === optimisticDecision.id ? newDecision : d
        ));
      }
      
      return newDecision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create decision';
      console.error('Error creating decision:', err);
      toast({
        title: "Error Creating Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions, onImmediateUpdate]);

  const updateDecision = useCallback(async (decision: Decision) => {
    try {
      console.log('Updating decision:', decision.id, 'with preAnalysis:', decision.preAnalysis);
      
      // Apply immediate update for optimistic UI
      if (onImmediateUpdate) {
        console.log('Applying immediate optimistic update for decision update');
        onImmediateUpdate(decision);
      }
      
      // Pause real-time updates for this decision to prevent conflicts
      if (pauseRealtimeForDecision) {
        pauseRealtimeForDecision(decision.id, 3000);
      }
      
      const updatedDecision = await decisionService.updateDecision(decision);
      console.log('Decision updated successfully, DB returned:', updatedDecision.preAnalysis);
      
      if (!isRealTimeConnected) {
        setDecisions(prev => 
          prev.map(d => d.id === updatedDecision.id ? updatedDecision : d)
        );
      }
      
      return updatedDecision;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update decision';
      console.error('Error updating decision:', err);
      toast({
        title: "Error Updating Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions, pauseRealtimeForDecision, onImmediateUpdate]);

  const deleteDecision = useCallback(async (id: string) => {
    try {
      console.log('Deleting decision:', id);
      await decisionService.deleteDecision(id);
      
      if (!isRealTimeConnected) {
        setDecisions(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete decision';
      console.error('Error deleting decision:', err);
      toast({
        title: "Error Deleting Decision",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, isRealTimeConnected, setDecisions]);

  return {
    createDecision,
    updateDecision,
    deleteDecision
  };
};

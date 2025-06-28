
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useToast } from '@/hooks/use-toast';

interface UseDecisionCRUDProps {
  isRealTimeConnected: boolean;
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
}

export const useDecisionCRUD = ({ isRealTimeConnected, setDecisions }: UseDecisionCRUDProps) => {
  const { toast } = useToast();

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating decision:', decision.title);
      const newDecision = await decisionService.createDecision(decision);
      
      if (!isRealTimeConnected) {
        setDecisions(prev => [newDecision, ...prev]);
      }
      
      toast({
        title: "Decision Created",
        description: `"${newDecision.title}" has been added to your pipeline.`
      });
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
  }, [toast, isRealTimeConnected, setDecisions]);

  const updateDecision = useCallback(async (decision: Decision) => {
    try {
      console.log('Updating decision:', decision.id);
      const updatedDecision = await decisionService.updateDecision(decision);
      
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
  }, [toast, isRealTimeConnected, setDecisions]);

  const deleteDecision = useCallback(async (id: string) => {
    try {
      console.log('Deleting decision:', id);
      await decisionService.deleteDecision(id);
      
      if (!isRealTimeConnected) {
        setDecisions(prev => prev.filter(d => d.id !== id));
      }
      
      toast({
        title: "Decision Deleted",
        description: "The decision has been removed from your pipeline."
      });
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

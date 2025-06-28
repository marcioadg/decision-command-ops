
import { useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { useAuth } from '@/hooks/useAuth';
import { useDecisions } from '@/hooks/useDecisions';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';

export const useIndexActions = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { updateDecision, createDecision, refreshDecisions } = useDecisions();

  const handleDecisionUpdate = useCallback(async (updatedDecision: Decision) => {
    console.log('useIndexActions: handleDecisionUpdate called with:', updatedDecision);
    try {
      console.log('useIndexActions: Calling updateDecision service');
      await updateDecision(updatedDecision);
      console.log('useIndexActions: updateDecision completed successfully');
      soundSystem.playCardDrop();
    } catch (error) {
      console.error('useIndexActions: Error in handleDecisionUpdate:', error);
      // Error is already handled in the hook
    }
  }, [updateDecision]);

  const handleQuickAdd = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    console.log('useIndexActions: handleQuickAdd called with:', decision);
    try {
      await createDecision(decision);
      soundSystem.playCardDrop();
    } catch (error) {
      console.error('useIndexActions: Error in handleQuickAdd:', error);
      // Error is already handled in the hook
    }
  }, [createDecision]);

  const handleArchive = useCallback(async (decision: Decision) => {
    try {
      const updatedDecision: Decision = {
        ...decision,
        archived: !decision.archived,
        updatedAt: new Date()
      };
      await updateDecision(updatedDecision);
      soundSystem.playArchive();
    } catch (error) {
      // Error is already handled in the hook
    }
  }, [updateDecision]);

  const handleLogout = useCallback(() => {
    signOut();
    toast({
      title: "SESSION TERMINATED",
      description: "You have been logged out",
    });
  }, [signOut, toast]);

  const handleRetry = useCallback(() => {
    console.log('Manual retry requested');
    refreshDecisions();
  }, [refreshDecisions]);

  return {
    handleDecisionUpdate,
    handleQuickAdd,
    handleArchive,
    handleLogout,
    handleRetry
  };
};

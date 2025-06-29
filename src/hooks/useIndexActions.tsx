
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
      // Error is already handled in the hook with proper security-safe messages
    }
  }, [updateDecision]);

  const handleQuickAdd = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    console.log('useIndexActions: handleQuickAdd called with:', decision);
    try {
      await createDecision(decision);
      soundSystem.playCardDrop();
    } catch (error) {
      console.error('useIndexActions: Error in handleQuickAdd:', error);
      // Error is already handled in the hook with proper security-safe messages
    }
  }, [createDecision]);

  const handleArchive = useCallback(async (decision: Decision) => {
    console.log('useIndexActions: handleArchive called for decision:', decision.id);
    try {
      const updatedDecision: Decision = {
        ...decision,
        archived: !decision.archived,
        updatedAt: new Date()
      };
      
      console.log('useIndexActions: Archiving decision with database update');
      
      // Wait for the database update to complete fully
      await updateDecision(updatedDecision);
      console.log('useIndexActions: Archive database update completed');
      
      // Add a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now refresh to ensure UI consistency
      console.log('useIndexActions: Refreshing decisions after archive');
      refreshDecisions();
      
      soundSystem.playArchive();
    } catch (error) {
      console.error('useIndexActions: Error in handleArchive:', error);
      // Enhanced error handling with security-safe messages
      toast({
        title: "Archive Failed",
        description: `Failed to ${decision.archived ? 'restore' : 'archive'} the decision. Please try again.`,
        variant: "destructive"
      });
    }
  }, [updateDecision, refreshDecisions, toast]);

  const handleLogout = useCallback(() => {
    console.log('useIndexActions: Logging out user');
    // Clear any sensitive data from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('decision') || key.includes('user') || key.includes('auth')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    signOut();
  }, [signOut]);

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

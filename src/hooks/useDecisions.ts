import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export const useDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadDecisions = useCallback(async (showToast = true) => {
    if (!user) {
      console.log('No user found, clearing decisions');
      setDecisions([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      console.log('Loading decisions for user:', user.id);
      setLoading(true);
      setError(null);
      
      const data = await decisionService.getDecisions();
      console.log('Loaded decisions:', data.length);
      
      setDecisions(data);
      setRetryCount(0); // Reset retry count on success
      
      if (showToast && data.length === 0) {
        toast({
          title: "No Decisions Found",
          description: "Start by creating your first decision using the Quick Add button."
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load decisions';
      console.error('Error loading decisions:', err);
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      if (showToast) {
        toast({
          title: "Error Loading Decisions",
          description: errorMessage,
          variant: "destructive",
          action: retryCount < 3 ? (
            <ToastAction altText="Retry loading decisions" onClick={() => loadDecisions(false)}>
              Retry
            </ToastAction>
          ) : undefined
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast, retryCount]);

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating decision:', decision.title);
      const newDecision = await decisionService.createDecision(decision);
      setDecisions(prev => [newDecision, ...prev]);
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
  }, [toast]);

  const updateDecision = useCallback(async (decision: Decision) => {
    try {
      console.log('Updating decision:', decision.id);
      const updatedDecision = await decisionService.updateDecision(decision);
      setDecisions(prev => 
        prev.map(d => d.id === updatedDecision.id ? updatedDecision : d)
      );
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
  }, [toast]);

  const deleteDecision = useCallback(async (id: string) => {
    try {
      console.log('Deleting decision:', id);
      await decisionService.deleteDecision(id);
      setDecisions(prev => prev.filter(d => d.id !== id));
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
  }, [toast]);

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      console.log('Starting localStorage migration...');
      const migratedCount = await decisionService.migrateLocalStorageDecisions();
      if (migratedCount > 0) {
        toast({
          title: "Data Migrated",
          description: `${migratedCount} decisions have been migrated to your account.`
        });
        await loadDecisions(false); // Reload decisions after migration
      }
      return migratedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to migrate data';
      console.error('Error migrating decisions:', err);
      toast({
        title: "Migration Error",
        description: errorMessage,
        variant: "destructive"
      });
      return 0;
    }
  }, [toast, loadDecisions]);

  // Auto-retry on mount if there was an error
  useEffect(() => {
    if (error && retryCount < 3) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Auto-retrying in ${retryDelay}ms (attempt ${retryCount + 1})`);
      
      const timer = setTimeout(() => {
        loadDecisions(false);
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loadDecisions]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  return {
    decisions,
    loading,
    error,
    createDecision,
    updateDecision,
    deleteDecision,
    migrateFromLocalStorage,
    refreshDecisions: () => loadDecisions(true),
    retryCount
  };
};

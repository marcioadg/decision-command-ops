
import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadDecisions = useCallback(async () => {
    if (!user) {
      setDecisions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await decisionService.getDecisions();
      setDecisions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load decisions';
      setError(errorMessage);
      console.error('Error loading decisions:', err);
      toast({
        title: "Error Loading Decisions",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
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
      const migratedCount = await decisionService.migrateLocalStorageDecisions();
      if (migratedCount > 0) {
        toast({
          title: "Data Migrated",
          description: `${migratedCount} decisions have been migrated to your account.`
        });
        await loadDecisions(); // Reload decisions after migration
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
    refreshDecisions: loadDecisions
  };
};

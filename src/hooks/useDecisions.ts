
import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDecisionRealtime } from './decision/useDecisionRealtime';
import { useDecisionCRUD } from './decision/useDecisionCRUD';
import { useDecisionRetry } from './decision/useDecisionRetry';

export const useDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Set up real-time subscription
  const { isRealTimeConnected, pauseRealtimeForDecision } = useDecisionRealtime({ user, setDecisions });

  // Set up CRUD operations
  const { createDecision, updateDecision, deleteDecision } = useDecisionCRUD({
    isRealTimeConnected,
    setDecisions,
    pauseRealtimeForDecision
  });

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
      console.log('Loaded decisions with preAnalysis data:', data.map(d => ({ 
        id: d.id, 
        title: d.title, 
        preAnalysis: d.preAnalysis 
      })));
      
      setDecisions(data);
      setRetryCount(0);
      
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
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Set up auto-retry logic
  useDecisionRetry({ error, retryCount, loadDecisions });

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      console.log('Starting localStorage migration...');
      const migratedCount = await decisionService.migrateLocalStorageDecisions();
      if (migratedCount > 0) {
        toast({
          title: "Data Migrated",
          description: `${migratedCount} decisions have been migrated to your account.`
        });
        await loadDecisions(false);
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
    refreshDecisions: () => loadDecisions(true),
    retryCount,
    isRealTimeConnected
  };
};

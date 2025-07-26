
import { useState, useEffect, useCallback, useRef } from 'react';
import { Decision } from '@/types/Decision';
import { secureDecisionService } from '@/services/secureDecisionService';
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
  
  // Prevent multiple simultaneous fetches
  const loadingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Set up real-time subscription
  const { isRealTimeConnected, pauseRealtimeForDecision, retryConnection } = useDecisionRealtime({ user, setDecisions });

  // Callback for immediate UI updates
  const handleImmediateUpdate = useCallback((decision: Decision) => {
    console.log('useDecisions: Handling immediate update for decision:', decision.id, 'stage:', decision.stage, 'isOptimistic:', decision.id.startsWith('temp-'));
    setDecisions(prev => {
      const exists = prev.find(d => d.id === decision.id);
      const isOptimistic = decision.id.startsWith('temp-');
      const hasOptimistic = prev.find(d => d.id.startsWith('temp-'));
      
      console.log('useDecisions: Current state - exists:', !!exists, 'isOptimistic:', isOptimistic, 'hasOptimistic:', !!hasOptimistic, 'currentCount:', prev.length);
      console.log('useDecisions: Decision update details:', {
        id: decision.id,
        stage: decision.stage,
        title: decision.title,
        existingStage: exists?.stage
      });
      
      if (!isOptimistic && hasOptimistic) {
        // Replace the optimistic decision with the real one
        console.log('useDecisions: Replacing optimistic decision with real one');
        const newDecisions = prev.map(d => d.id.startsWith('temp-') ? decision : d);
        console.log('useDecisions: New decisions count after replace:', newDecisions.length);
        return newDecisions;
      } else if (exists) {
        // Update existing decision
        console.log('useDecisions: Updating existing decision with new stage:', decision.stage);
        const newDecisions = prev.map(d => d.id === decision.id ? decision : d);
        console.log('useDecisions: Updated decision stage successfully');
        return newDecisions;
      } else {
        // Add new decision
        console.log('useDecisions: Adding new decision to state');
        const newDecisions = [decision, ...prev];
        console.log('useDecisions: New decisions count after add:', newDecisions.length);
        return newDecisions;
      }
    });
  }, []);

  // Set up CRUD operations with secure service
  const { createDecision, updateDecision, deleteDecision } = useDecisionCRUD({
    isRealTimeConnected,
    setDecisions,
    pauseRealtimeForDecision,
    onImmediateUpdate: handleImmediateUpdate
  });

  const loadDecisions = useCallback(async (showToast = true) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('useDecisions: Load already in progress, skipping');
      return;
    }

    if (!user) {
      console.log('No user found, clearing decisions');
      setDecisions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check if user changed - if so, reset everything
    if (userIdRef.current && userIdRef.current !== user.id) {
      console.log('User changed, resetting decisions state');
      setDecisions([]);
      setError(null);
      setRetryCount(0);
    }
    userIdRef.current = user.id;

    try {
      console.log('Loading decisions for user:', user.id);
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await secureDecisionService.getDecisions();
      console.log('Loaded decisions:', data.length);
      
      setDecisions(data);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load decisions';
      console.error('Error loading decisions:', err);
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      if (showToast) {
        toast({
          title: "Error Loading Decisions",
          description: "Unable to load your decisions. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, toast]);

  // Set up auto-retry logic
  useDecisionRetry({ error, retryCount, loadDecisions });

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      console.log('Starting localStorage migration...');
      const migratedCount = await secureDecisionService.migrateLocalStorageDecisions();
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
        description: "Unable to migrate your data. Please try again.",
        variant: "destructive"
      });
      return 0;
    }
  }, [toast, loadDecisions]);

  // Load decisions when user changes (but not on every render)
  useEffect(() => {
    if (user?.id && user.id !== userIdRef.current) {
      console.log('useDecisions: User authenticated, loading decisions');
      loadDecisions();
    }
  }, [user?.id, loadDecisions]);

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
    isRealTimeConnected,
    pauseRealtimeForDecision,
    onImmediateUpdate: handleImmediateUpdate,
    retryConnection
  };
};

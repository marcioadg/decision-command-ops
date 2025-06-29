
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Prevent multiple simultaneous fetches
  const loadingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // Set up real-time subscription
  const { isRealTimeConnected, pauseRealtimeForDecision, retryConnection } = useDecisionRealtime({ user, setDecisions });

  // Callback for immediate UI updates
  const handleImmediateUpdate = useCallback((decision: Decision) => {
    console.log('useDecisions: Handling immediate update for decision:', decision.id);
    setDecisions(prev => {
      const exists = prev.find(d => d.id === decision.id);
      if (exists) {
        // Update existing decision
        return prev.map(d => d.id === decision.id ? decision : d);
      } else {
        // Add new decision
        return [decision, ...prev];
      }
    });
  }, []);

  // Set up CRUD operations with immediate update callback
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
      
      const data = await decisionService.getDecisions();
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
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [user?.id, toast]); // Only depend on user.id to prevent multiple loads

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

  // Load decisions when user changes (but not on every render)
  useEffect(() => {
    if (user?.id && user.id !== userIdRef.current) {
      console.log('useDecisions: User authenticated, loading decisions');
      loadDecisions();
    }
  }, [user?.id]); // Only depend on user.id

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

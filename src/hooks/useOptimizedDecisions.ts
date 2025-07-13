import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Decision } from '@/types/Decision';
import { secureDecisionService } from '@/services/secureDecisionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDecisionRealtime } from './decision/useDecisionRealtime';
import { useDecisionCRUD } from './decision/useDecisionCRUD';

// Cache for decisions to reduce unnecessary API calls
const decisionsCache = new Map<string, { data: Decision[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const useOptimizedDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Prevent race conditions and duplicate requests
  const loadingRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set up real-time subscription with optimizations
  const { isRealTimeConnected, pauseRealtimeForDecision, retryConnection } = useDecisionRealtime({ 
    user, 
    setDecisions 
  });

  // Optimized immediate update handler
  const handleImmediateUpdate = useCallback((decision: Decision) => {
    setDecisions(prev => {
      const index = prev.findIndex(d => d.id === decision.id);
      if (index >= 0) {
        // Update existing decision without creating new array if data is the same
        const existing = prev[index];
        if (JSON.stringify(existing) === JSON.stringify(decision)) {
          return prev; // No change, return same reference
        }
        const newDecisions = [...prev];
        newDecisions[index] = decision;
        return newDecisions;
      } else {
        // Add new decision
        return [decision, ...prev];
      }
    });
  }, []);

  // Set up CRUD operations
  const { createDecision, updateDecision, deleteDecision } = useDecisionCRUD({
    isRealTimeConnected,
    setDecisions,
    pauseRealtimeForDecision,
    onImmediateUpdate: handleImmediateUpdate
  });

  // Check cache first before making API call
  const getCachedDecisions = useCallback((userId: string) => {
    const cached = decisionsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('useOptimizedDecisions: Using cached decisions');
      return cached.data;
    }
    return null;
  }, []);

  // Update cache
  const setCachedDecisions = useCallback((userId: string, data: Decision[]) => {
    decisionsCache.set(userId, { data, timestamp: Date.now() });
  }, []);

  const loadDecisions = useCallback(async (showToast = true, useCache = true) => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('useOptimizedDecisions: Load already in progress, skipping');
      return;
    }

    if (!user) {
      console.log('No user found, clearing decisions');
      setDecisions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    if (useCache) {
      const cached = getCachedDecisions(user.id);
      if (cached) {
        setDecisions(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const data = await secureDecisionService.getDecisions();
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }
      
      console.log('Loaded decisions:', data.length);
      
      setDecisions(data);
      setCachedDecisions(user.id, data);
      setRetryCount(0);
    } catch (err) {
      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

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
      abortControllerRef.current = null;
    }
  }, [user?.id, toast, getCachedDecisions, setCachedDecisions]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && retryCount > 0 && retryCount < 4) {
      const timeout = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Max 10 seconds
      console.log(`Auto-retrying in ${timeout}ms (attempt ${retryCount})`);
      
      const timeoutId = setTimeout(() => {
        loadDecisions(false, false); // Don't use cache on retry
      }, timeout);
      
      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, loadDecisions]);

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      console.log('Starting localStorage migration...');
      const migratedCount = await secureDecisionService.migrateLocalStorageDecisions();
      if (migratedCount > 0) {
        toast({
          title: "Data Migrated",
          description: `${migratedCount} decisions have been migrated to your account.`
        });
        // Clear cache and reload
        if (user?.id) {
          decisionsCache.delete(user.id);
        }
        await loadDecisions(false, false);
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
  }, [toast, loadDecisions, user?.id]);

  // Load decisions when user changes (debounced)
  useEffect(() => {
    if (user?.id && user.id !== userIdRef.current) {
      console.log('useOptimizedDecisions: User authenticated, loading decisions');
      const timeoutId = setTimeout(() => {
        loadDecisions();
      }, 100); // Small debounce to prevent rapid successive calls
      
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, loadDecisions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoize return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    decisions,
    loading,
    error,
    createDecision,
    updateDecision,
    deleteDecision,
    migrateFromLocalStorage,
    refreshDecisions: () => {
      // Clear cache and force reload
      if (user?.id) {
        decisionsCache.delete(user.id);
      }
      loadDecisions(true, false);
    },
    retryCount,
    isRealTimeConnected,
    pauseRealtimeForDecision,
    onImmediateUpdate: handleImmediateUpdate,
    retryConnection
  }), [
    decisions,
    loading,
    error,
    createDecision,
    updateDecision,
    deleteDecision,
    migrateFromLocalStorage,
    retryCount,
    isRealTimeConnected,
    pauseRealtimeForDecision,
    handleImmediateUpdate,
    retryConnection,
    user?.id,
    loadDecisions
  ]);

  return returnValue;
};
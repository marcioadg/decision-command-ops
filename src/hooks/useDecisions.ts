import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/types/Decision';
import { decisionService } from '@/services/decisionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
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
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for decisions');
    
    const channel = supabase
      .channel('decisions-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'decisions',
          filter: `user_id=eq.${user.id}` // Only listen to current user's decisions
        },
        (payload) => {
          console.log('Real-time decision change received:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          setDecisions(prev => {
            switch (eventType) {
              case 'INSERT':
                if (newRecord) {
                  // Convert database record to Decision type
                  const newDecision: Decision = {
                    id: newRecord.id,
                    title: newRecord.title,
                    category: newRecord.category,
                    priority: newRecord.priority === 'high' ? 'high' : newRecord.priority === 'medium' ? 'medium' : 'low',
                    stage: newRecord.stage,
                    confidence: newRecord.confidence,
                    owner: newRecord.owner || '',
                    createdAt: new Date(newRecord.created_at),
                    updatedAt: newRecord.updated_at ? new Date(newRecord.updated_at) : undefined,
                    notes: newRecord.notes || undefined,
                    biasCheck: newRecord.bias_check || undefined,
                    archived: newRecord.archived || false,
                    reflection: {
                      sevenDay: newRecord.reflection_7_day_date ? {
                        date: new Date(newRecord.reflection_7_day_date),
                        completed: newRecord.reflection_7_day_completed || false,
                        answers: newRecord.reflection_7_day_answers || undefined
                      } : undefined,
                      thirtyDay: newRecord.reflection_30_day_date ? {
                        date: new Date(newRecord.reflection_30_day_date),
                        completed: newRecord.reflection_30_day_completed || false,
                        answers: newRecord.reflection_30_day_answers || undefined
                      } : undefined,
                      ninetyDay: newRecord.reflection_90_day_date ? {
                        date: new Date(newRecord.reflection_90_day_date),
                        completed: newRecord.reflection_90_day_completed || false,
                        answers: newRecord.reflection_90_day_answers || undefined
                      } : undefined,
                      questions: newRecord.reflection_questions || undefined
                    }
                  };
                  
                  // Check if decision already exists to avoid duplicates
                  const exists = prev.some(d => d.id === newDecision.id);
                  if (!exists) {
                    console.log('Adding new decision from real-time:', newDecision.id);
                    return [newDecision, ...prev];
                  }
                }
                return prev;
                
              case 'UPDATE':
                if (newRecord) {
                  console.log('Updating decision from real-time:', newRecord.id);
                  return prev.map(decision => {
                    if (decision.id === newRecord.id) {
                      return {
                        ...decision,
                        title: newRecord.title,
                        category: newRecord.category,
                        priority: newRecord.priority === 'high' ? 'high' : newRecord.priority === 'medium' ? 'medium' : 'low',
                        stage: newRecord.stage,
                        confidence: newRecord.confidence,
                        owner: newRecord.owner || '',
                        updatedAt: newRecord.updated_at ? new Date(newRecord.updated_at) : new Date(),
                        notes: newRecord.notes || undefined,
                        biasCheck: newRecord.bias_check || undefined,
                        archived: newRecord.archived || false,
                        reflection: {
                          sevenDay: newRecord.reflection_7_day_date ? {
                            date: new Date(newRecord.reflection_7_day_date),
                            completed: newRecord.reflection_7_day_completed || false,
                            answers: newRecord.reflection_7_day_answers || undefined
                          } : undefined,
                          thirtyDay: newRecord.reflection_30_day_date ? {
                            date: new Date(newRecord.reflection_30_day_date),
                            completed: newRecord.reflection_30_day_completed || false,
                            answers: newRecord.reflection_30_day_answers || undefined
                          } : undefined,
                          ninetyDay: newRecord.reflection_90_day_date ? {
                            date: new Date(newRecord.reflection_90_day_date),
                            completed: newRecord.reflection_90_day_completed || false,
                            answers: newRecord.reflection_90_day_answers || undefined
                          } : undefined,
                          questions: newRecord.reflection_questions || undefined
                        }
                      };
                    }
                    return decision;
                  });
                }
                return prev;
                
              case 'DELETE':
                if (oldRecord) {
                  console.log('Removing decision from real-time:', oldRecord.id);
                  return prev.filter(decision => decision.id !== oldRecord.id);
                }
                return prev;
                
              default:
                return prev;
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR') {
          console.error('Real-time channel error');
          setIsRealTimeConnected(false);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setIsRealTimeConnected(false);
    };
  }, [user]);

  const createDecision = useCallback(async (decision: Omit<Decision, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating decision:', decision.title);
      const newDecision = await decisionService.createDecision(decision);
      
      // Don't manually update state here - let real-time handle it
      // But if real-time is not connected, fall back to manual update
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
  }, [toast, isRealTimeConnected]);

  const updateDecision = useCallback(async (decision: Decision) => {
    try {
      console.log('Updating decision:', decision.id);
      const updatedDecision = await decisionService.updateDecision(decision);
      
      // Don't manually update state here - let real-time handle it
      // But if real-time is not connected, fall back to manual update
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
  }, [toast, isRealTimeConnected]);

  const deleteDecision = useCallback(async (id: string) => {
    try {
      console.log('Deleting decision:', id);
      await decisionService.deleteDecision(id);
      
      // Don't manually update state here - let real-time handle it
      // But if real-time is not connected, fall back to manual update
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
  }, [toast, isRealTimeConnected]);

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
    retryCount,
    isRealTimeConnected
  };
};

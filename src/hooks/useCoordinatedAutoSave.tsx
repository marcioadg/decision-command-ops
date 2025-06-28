
import { useCallback, useRef, useState } from 'react';
import { Decision } from '@/types/Decision';

interface UseCoordinatedAutoSaveProps {
  decision: Decision | null; // Allow null decision
  onSave: (updates: Partial<Decision>) => Promise<void>;
  pauseRealtimeForDecision?: (decisionId: string, duration?: number) => void;
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const useCoordinatedAutoSave = ({ 
  decision, 
  onSave, 
  pauseRealtimeForDecision 
}: UseCoordinatedAutoSaveProps) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdatesRef = useRef<Partial<Decision>>({});
  const isSavingRef = useRef(false);

  const batchedSave = useCallback(async (updates: Partial<Decision>) => {
    // FIXED: Early return if no decision with proper logging
    if (!decision) {
      console.log('useCoordinatedAutoSave: No decision provided, skipping save');
      return;
    }

    console.log('useCoordinatedAutoSave: Batching save for decision:', decision.id, 'updates:', updates);

    // Add updates to pending batch
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip if already saving
    if (isSavingRef.current) {
      console.log('useCoordinatedAutoSave: Already saving, batching update');
      return;
    }

    setSaveStatus({ status: 'saving' });

    // Set new timeout for batched save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        
        // FIXED: Double-check decision still exists
        if (!decision) {
          console.log('useCoordinatedAutoSave: Decision no longer available during save');
          setSaveStatus({ status: 'idle' });
          return;
        }

        if (pauseRealtimeForDecision) {
          pauseRealtimeForDecision(decision.id, 5000);
        }

        const updatesToSave = { ...pendingUpdatesRef.current };
        pendingUpdatesRef.current = {}; // Clear pending updates

        console.log('useCoordinatedAutoSave: Executing batched save:', updatesToSave);
        await onSave(updatesToSave);
        
        setSaveStatus({ 
          status: 'saved', 
          lastSaved: new Date() 
        });

        // Reset to idle after showing saved status
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, status: 'idle' }));
        }, 2000);

      } catch (error) {
        console.error('useCoordinatedAutoSave: Save failed:', error);
        setSaveStatus({ 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Save failed' 
        });

        // Reset error status after 5 seconds
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, status: 'idle', error: undefined }));
        }, 5000);
      } finally {
        isSavingRef.current = false;
      }
    }, 1000);
  }, [decision?.id, onSave, pauseRealtimeForDecision]); // FIXED: Use decision?.id to avoid stale closures

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  return {
    batchedSave,
    saveStatus,
    cleanup
  };
};

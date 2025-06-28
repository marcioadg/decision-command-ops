import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void | Promise<void>;
  delay?: number;
}

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const useAutoSave = <T,>({ data, onSave, delay = 1000 }: UseAutoSaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const isInitialMount = useRef(true);

  useEffect(() => {
    console.log('useAutoSave: Effect triggered with data:', data);
    
    // Skip auto-save on initial mount to avoid saving unchanged data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDataRef.current = data;
      return;
    }
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('useAutoSave: Cleared existing timeout');
    }

    // Only auto-save if data exists and has actually changed
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const currentDataString = JSON.stringify(data);
      const previousDataString = JSON.stringify(previousDataRef.current);
      
      console.log('useAutoSave: Comparing data strings:');
      console.log('  Current:', currentDataString);
      console.log('  Previous:', previousDataString);
      
      if (currentDataString !== previousDataString) {
        console.log('useAutoSave: Data changed, setting timeout for auto-save');
        setSaveStatus({ status: 'saving' });
        
        timeoutRef.current = setTimeout(async () => {
          try {
            console.log('useAutoSave: Executing auto-save with data:', data);
            await onSave(data);
            previousDataRef.current = JSON.parse(JSON.stringify(data)); // Deep clone to avoid reference issues
            setSaveStatus({ 
              status: 'saved', 
              lastSaved: new Date() 
            });
            console.log('useAutoSave: Auto-save completed successfully');
            
            // Reset to idle after showing saved status for 2 seconds
            setTimeout(() => {
              setSaveStatus(prev => ({ ...prev, status: 'idle' }));
            }, 2000);
          } catch (error) {
            console.error('useAutoSave: Auto-save failed:', error);
            setSaveStatus({ 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Save failed' 
            });
            
            // Reset error status after 5 seconds
            setTimeout(() => {
              setSaveStatus(prev => ({ ...prev, status: 'idle', error: undefined }));
            }, 5000);
          }
        }, delay);
      } else {
        console.log('useAutoSave: Data unchanged, skipping auto-save');
        setSaveStatus(prev => prev.status === 'saving' ? { ...prev, status: 'idle' } : prev);
      }
    } else {
      console.log('useAutoSave: Invalid data, skipping auto-save');
      setSaveStatus(prev => prev.status === 'saving' ? { ...prev, status: 'idle' } : prev);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return saveStatus;
};

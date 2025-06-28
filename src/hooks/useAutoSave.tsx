
import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void | Promise<void>;
  delay?: number;
}

export const useAutoSave = <T,>({ data, onSave, delay = 1000 }: UseAutoSaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    console.log('useAutoSave: Effect triggered with data:', data);
    
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
        timeoutRef.current = setTimeout(async () => {
          console.log('useAutoSave: Executing auto-save with data:', data);
          await onSave(data);
          previousDataRef.current = data;
          console.log('useAutoSave: Auto-save completed, updated previousDataRef');
        }, delay);
      } else {
        console.log('useAutoSave: Data unchanged, skipping auto-save');
      }
    } else {
      console.log('useAutoSave: Invalid data, skipping auto-save');
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
};

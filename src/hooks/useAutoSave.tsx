
import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void;
  delay?: number;
}

export const useAutoSave = <T,>({ data, onSave, delay = 1000 }: UseAutoSaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      timeoutRef.current = setTimeout(() => {
        onSave(data);
        previousDataRef.current = data;
      }, delay);
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

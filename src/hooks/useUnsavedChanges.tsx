
import { useEffect, useState, useRef } from 'react';
import { Decision } from '@/types/Decision';

interface UseUnsavedChangesProps {
  originalDecision: Decision | null;
  currentDecision: Decision | null;
}

export const useUnsavedChanges = ({ originalDecision, currentDecision }: UseUnsavedChangesProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalDataRef = useRef<Decision | null>(null);

  // Store the original data when decision is first loaded
  useEffect(() => {
    if (originalDecision && !originalDataRef.current) {
      originalDataRef.current = JSON.parse(JSON.stringify(originalDecision));
      console.log('useUnsavedChanges: Stored original decision data');
    }
  }, [originalDecision]);

  // Check for changes whenever current decision updates
  useEffect(() => {
    if (!originalDataRef.current || !currentDecision) {
      setHasUnsavedChanges(false);
      return;
    }

    const originalString = JSON.stringify(originalDataRef.current);
    const currentString = JSON.stringify({
      ...currentDecision,
      updatedAt: originalDataRef.current.updatedAt // Ignore updatedAt changes for comparison
    });

    const hasChanges = originalString !== currentString;
    console.log('useUnsavedChanges: Checking for changes:', hasChanges);
    setHasUnsavedChanges(hasChanges);
  }, [currentDecision]);

  const resetChanges = () => {
    if (originalDecision) {
      originalDataRef.current = JSON.parse(JSON.stringify(originalDecision));
      setHasUnsavedChanges(false);
      console.log('useUnsavedChanges: Reset changes tracking');
    }
  };

  return {
    hasUnsavedChanges,
    resetChanges
  };
};


import { useEffect } from 'react';

interface UseDecisionRetryProps {
  error: string | null;
  retryCount: number;
  loadDecisions: (showToast?: boolean) => Promise<void>;
}

export const useDecisionRetry = ({ error, retryCount, loadDecisions }: UseDecisionRetryProps) => {
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
};

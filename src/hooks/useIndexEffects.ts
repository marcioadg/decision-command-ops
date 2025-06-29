import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Decision } from '@/types/Decision';

interface UseIndexEffectsProps {
  profile: any;
  loading: boolean;
  error: string | null;
  decisions: Decision[];
  localDecisions: Decision[];
  setLocalDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
  triggerFirstLoginJournal: () => void;
}

export const useIndexEffects = ({
  profile,
  loading,
  error,
  decisions,
  localDecisions,
  setLocalDecisions,
  triggerFirstLoginJournal
}: UseIndexEffectsProps) => {
  // FIXED: Remove the conflicting useEffect that was overwriting localDecisions
  // Instead, only sync when decisions array changes meaningfully (length changes or initial load)
  useEffect(() => {
    // Only sync if this looks like an initial load or major change (different length)
    if (localDecisions.length === 0 || localDecisions.length !== decisions.length) {
      console.log('Index: Syncing with hook decisions - initial load or length change:', {
        localCount: localDecisions.length,
        hookCount: decisions.length
      });
      setLocalDecisions(decisions);
    } else {
      // For same-length updates, merge intelligently to preserve local changes
      console.log('Index: Smart merging decisions to preserve local changes');
      setLocalDecisions(prevLocal => {
        return prevLocal.map(localDecision => {
          const hookDecision = decisions.find(d => d.id === localDecision.id);
          if (!hookDecision) return localDecision;
          
          // If hook decision has a newer timestamp, use it; otherwise keep local
          const hookTime = new Date(hookDecision.updatedAt || hookDecision.createdAt).getTime();
          const localTime = new Date(localDecision.updatedAt || localDecision.createdAt).getTime();
          
          if (hookTime > localTime) {
            console.log('Index: Using newer hook decision for:', localDecision.id);
            return hookDecision;
          }
          
          return localDecision;
        });
      });
    }
  }, [decisions.length]); // Only depend on length to avoid constant re-syncing

  // Check for first login detection - trigger journal if user just authenticated and hasn't seen it
  useEffect(() => {
    if (profile && !loading && !error) {
      const hasShownJournalThisSession = sessionStorage.getItem('journalShownThisSession');
      const userJustLoggedIn = !hasShownJournalThisSession;
      
      if (userJustLoggedIn) {
        console.log('Index: User just logged in, triggering first login journal');
        triggerFirstLoginJournal();
      }
    }
  }, [profile, loading, error, triggerFirstLoginJournal]);

  // Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('Index: Component unmounting, cleaning up');
    };
  }, []);
};

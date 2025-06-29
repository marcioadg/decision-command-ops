
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
  
  // Sync decisions with improved logic to prevent unnecessary updates
  useEffect(() => {
    // Only sync if there's a meaningful difference
    const shouldSync = localDecisions.length === 0 || 
                      localDecisions.length !== decisions.length ||
                      decisions.some(hookDecision => {
                        const localDecision = localDecisions.find(d => d.id === hookDecision.id);
                        if (!localDecision) return true;
                        
                        // Check if hook decision is newer
                        const hookTime = new Date(hookDecision.updatedAt || hookDecision.createdAt).getTime();
                        const localTime = new Date(localDecision.updatedAt || localDecision.createdAt).getTime();
                        
                        return hookTime > localTime;
                      });

    if (shouldSync) {
      console.log('Index: Syncing with hook decisions:', {
        localCount: localDecisions.length,
        hookCount: decisions.length,
        reason: localDecisions.length === 0 ? 'initial' : 
                localDecisions.length !== decisions.length ? 'length_change' : 'newer_data'
      });
      setLocalDecisions(decisions);
    } else {
      console.log('Index: No sync needed - local decisions are up to date');
    }
  }, [decisions, setLocalDecisions]); // Depend on the actual decisions array

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
  }, [profile?.id, loading, error, triggerFirstLoginJournal]); // Use profile.id for stability

  // Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('Index: Component unmounting, cleaning up');
    };
  }, []);
};

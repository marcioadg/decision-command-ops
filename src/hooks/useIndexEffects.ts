
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
  }, [decisions, setLocalDecisions]);

  // Check for zero decisions and show journal - only after data has loaded
  useEffect(() => {
    if (profile && !loading && !error) {
      const hasShownJournalThisSession = sessionStorage.getItem('journalShownThisSession');
      
      console.log('Index: Checking journal conditions:', {
        hasProfile: !!profile,
        loading,
        error,
        decisionsCount: decisions.length,
        hasShownJournalThisSession: !!hasShownJournalThisSession
      });
      
      // Show journal if user has zero decisions and we haven't shown it this session
      if (decisions.length === 0 && !hasShownJournalThisSession) {
        console.log('Index: User has zero decisions, triggering journal');
        triggerFirstLoginJournal();
      } else if (decisions.length > 0) {
        console.log('Index: User has existing decisions, skipping journal popup');
        // Mark as shown to prevent future checks this session even if they delete all decisions
        if (!hasShownJournalThisSession) {
          sessionStorage.setItem('journalShownThisSession', 'true');
        }
      }
    }
  }, [profile?.id, loading, error, decisions.length, triggerFirstLoginJournal]);

  // Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('Index: Component unmounting, cleaning up');
    };
  }, []);
};

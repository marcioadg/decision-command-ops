import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { secureDecisionService } from '@/services/secureDecisionService';
import { Decision } from '@/types/Decision';
import { IndexHeader } from './IndexHeader';
import { MobileHeader } from './MobileHeader';
import { IndexMainContent } from './IndexMainContent';
import { IndexModals } from './IndexModals';
import { IndexLoadingScreen } from './IndexLoadingScreen';
import { IndexErrorScreen } from './IndexErrorScreen';
import { MissionBar } from './MissionBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexEffects } from '@/hooks/useIndexEffects';
import { useIndexMigration } from '@/hooks/useIndexMigration';
import { useIndexActions } from '@/hooks/useIndexActions';
import { useVisitTracking } from '@/hooks/useVisitTracking';

export const IndexContainer = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
  // Track page visit
  useVisitTracking('dashboard');
  
  const {
    selectedDecision,
    isDetailModalOpen,
    isQuickAddOpen,
    showArchived,
    hasMigrated,
    isJournalOpen,
    journalData,
    quickAddStage,
    setHasMigrated,
    handleCloseDetailModal,
    handleCloseQuickAdd,
    handleCloseJournal,
    handleDecisionClick,
    handleToggleArchived,
    handleQuickAddClick,
    handleJournalClick,
    handleJournalComplete,
    handleStageQuickAdd,
    triggerFirstLoginJournal
  } = useIndexState();
  const [localDecisions, setLocalDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflectionsDue, setReflectionsDue] = useState<{
    overdue: Decision[];
    dueToday: Decision[];
    dueThisWeek: Decision[];
  }>({ overdue: [], dueToday: [], dueThisWeek: [] });
  const [retryCount, setRetryCount] = useState(0);

  const {
    handleDecisionUpdate,
    handleQuickAdd,
    handleArchive,
    handleLogout,
    handleRetry
  } = useIndexActions();

  useIndexEffects({
    profile,
    loading,
    error,
    decisions: localDecisions,
    localDecisions,
    setLocalDecisions,
    triggerFirstLoginJournal
  });

  useIndexMigration({
    user,
    hasMigrated,
    setHasMigrated,
    setLocalDecisions
  });

  useEffect(() => {
    if (!user) return;

    const loadDecisions = async () => {
      setLoading(true);
      setRetryCount(prev => prev + 1);
      try {
        const decisions = await secureDecisionService.getDecisions();
        setLocalDecisions(decisions);

        const reflections = await secureDecisionService.getReflectionsDue();
        setReflectionsDue(reflections);
        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        console.error('Index: Error fetching decisions:', err);
        setError(err.message || 'Failed to load decisions.');
      } finally {
        setLoading(false);
      }
    };

    loadDecisions();
  }, [user?.id]);

  if (authLoading) {
    return <IndexLoadingScreen retryCount={retryCount} />;
  }

  if (error) {
    return <IndexErrorScreen error={error} onRetry={handleRetry} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      {isMobile ? (
        <MobileHeader
          profileName={profile?.name}
          decisions={localDecisions}
          showArchived={showArchived}
          error={error}
          onDecisionClick={handleDecisionClick}
          onQuickAddClick={handleQuickAddClick}
          onJournalClick={handleJournalClick}
          onToggleArchived={handleToggleArchived}
          onLogout={handleLogout}
        />
      ) : (
        <IndexHeader
          profileName={profile?.name}
          decisions={localDecisions}
          showArchived={showArchived}
          error={error}
          onDecisionClick={handleDecisionClick}
          onQuickAddClick={handleQuickAddClick}
          onJournalClick={handleJournalClick}
          onToggleArchived={handleToggleArchived}
          onLogout={handleLogout}
        />
      )}

      {/* Mission Bar */}
      <MissionBar />

      {/* Main Content */}
      <IndexMainContent
        decisions={localDecisions}
        showArchived={showArchived}
        onDecisionUpdate={handleDecisionUpdate}
        onDecisionClick={handleDecisionClick}
        onArchive={handleArchive}
        onQuickAdd={handleStageQuickAdd}
      />

      {/* Modals */}
      <IndexModals
        selectedDecision={selectedDecision}
        isDetailModalOpen={isDetailModalOpen}
        isQuickAddOpen={isQuickAddOpen}
        isJournalOpen={isJournalOpen}
        journalData={journalData}
        quickAddStage={quickAddStage}
        onCloseDetailModal={handleCloseDetailModal}
        onCloseQuickAdd={handleCloseQuickAdd}
        onCloseJournal={handleCloseJournal}
        onJournalComplete={handleJournalComplete}
        onQuickAdd={handleQuickAdd}
        onDecisionUpdate={handleDecisionUpdate}
      />
    </div>
  );
};

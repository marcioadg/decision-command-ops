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
import { useMobile } from '@/hooks/use-mobile';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexEffects } from '@/hooks/useIndexEffects';
import { useIndexMigration } from '@/hooks/useIndexMigration';
import { useIndexActions } from '@/hooks/useIndexActions';

export const IndexContainer = () => {
  const { user, profile, isLoading: authLoading, error: authError } = useAuth();
  const { isMobile } = useMobile();
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

  const {
    handleDecisionUpdate,
    handleDecisionDelete,
    handleDecisionArchive,
    handleDecisionCreate
  } = useIndexActions({
    setLocalDecisions,
    handleCloseDetailModal
  });

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
      try {
        const decisions = await secureDecisionService.getDecisions();
        setLocalDecisions(decisions);

        const reflections = await secureDecisionService.getReflectionsDue();
        setReflectionsDue(reflections);
        setError(null);
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
    return <IndexLoadingScreen />;
  }

  if (authError) {
    return <IndexErrorScreen message={authError} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      {isMobile ? (
        <MobileHeader
          showArchived={showArchived}
          onToggleArchived={handleToggleArchived}
          onQuickAdd={() => handleQuickAddClick()}
          onJournal={() => handleJournalClick()}
        />
      ) : (
        <IndexHeader
          decisionsCount={localDecisions.length}
          showArchived={showArchived}
          reflectionsDue={reflectionsDue}
          onToggleArchived={handleToggleArchived}
          onQuickAdd={() => handleQuickAddClick()}
          onJournal={() => handleJournalClick()}
        />
      )}

      {/* Mission Bar */}
      <MissionBar />

      {/* Main Content */}
      <IndexMainContent
        decisions={localDecisions}
        loading={loading}
        error={error}
        onDecisionClick={handleDecisionClick}
        onDecisionUpdate={handleDecisionUpdate}
        onDecisionDelete={handleDecisionDelete}
        onDecisionArchive={handleDecisionArchive}
        onQuickAdd={handleStageQuickAdd}
        showArchived={showArchived}
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
        onCreateDecision={handleDecisionCreate}
        onDecisionUpdate={handleDecisionUpdate}
      />
    </div>
  );
};

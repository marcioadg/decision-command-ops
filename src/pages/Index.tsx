
import { IndexHeader } from '@/components/IndexHeader';
import { MobileHeader } from '@/components/MobileHeader';
import { IndexLoadingScreen } from '@/components/IndexLoadingScreen';
import { IndexErrorScreen } from '@/components/IndexErrorScreen';
import { IndexMainContent } from '@/components/IndexMainContent';
import { IndexModals } from '@/components/IndexModals';
import { useAuth } from '@/hooks/useAuth';
import { useDecisions } from '@/hooks/useDecisions';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexActions } from '@/hooks/useIndexActions';
import { useIndexMigration } from '@/hooks/useIndexMigration';
import { useImmediateDecisionSync } from '@/hooks/useImmediateDecisionSync';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';

const Index = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  // Get decisions hook with all needed functions
  const decisionsHook = useDecisions();
  const {
    decisions,
    loading,
    error,
    retryCount,
    isRealTimeConnected
  } = decisionsHook;

  // Create local state setter for immediate updates
  const [localDecisions, setLocalDecisions] = useState(decisions);
  
  // Sync local decisions with hook decisions
  useEffect(() => {
    setLocalDecisions(decisions);
  }, [decisions]);

  // Set up immediate decision sync
  const { applyImmediateUpdate } = useImmediateDecisionSync({ 
    setDecisions: setLocalDecisions 
  });

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
    handleStageQuickAdd
  } = useIndexState();

  const {
    handleDecisionUpdate,
    handleQuickAdd,
    handleArchive,
    handleLogout,
    handleRetry
  } = useIndexActions();

  // Check for localStorage data and offer migration on first load
  useIndexMigration(hasMigrated, setHasMigrated);

  // Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('Index: Component unmounting, cleaning up');
    };
  }, []);

  // Add debug logging for modal state
  console.log('Index: Modal state debug', {
    selectedDecision: selectedDecision?.id,
    isDetailModalOpen,
    decisionsCount: localDecisions.length
  });

  if (loading) {
    return <IndexLoadingScreen retryCount={retryCount} />;
  }

  // Show error screen with retry option
  if (error && !loading) {
    return (
      <IndexErrorScreen
        error={error}
        onRetry={handleRetry}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
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

      <IndexMainContent
        decisions={localDecisions}
        showArchived={showArchived}
        onDecisionUpdate={handleDecisionUpdate}
        onDecisionClick={handleDecisionClick}
        onArchive={handleArchive}
        onQuickAdd={handleStageQuickAdd}
        isRealTimeConnected={isRealTimeConnected}
      />

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
        onDecisionUpdate={handleDecisionUpdate}
        onQuickAdd={handleQuickAdd}
        onJournalComplete={handleJournalComplete}
        onImmediateDecisionUpdate={applyImmediateUpdate}
      />
    </div>
  );
};

export default Index;

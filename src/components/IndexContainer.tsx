
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
import { useIndexEffects } from '@/hooks/useIndexEffects';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export const IndexContainer = () => {
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

  // Create local state for immediate updates - this will be the source of truth for UI
  const [localDecisions, setLocalDecisions] = useState(decisions);

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

  const {
    handleDecisionUpdate,
    handleQuickAdd,
    handleArchive,
    handleLogout,
    handleRetry
  } = useIndexActions();

  // Set up immediate decision sync for instant UI updates
  const { applyImmediateUpdate } = useImmediateDecisionSync({ 
    setDecisions: setLocalDecisions 
  });

  // Handle all side effects
  useIndexEffects({
    profile,
    loading,
    error,
    decisions,
    localDecisions,
    setLocalDecisions,
    triggerFirstLoginJournal
  });

  // Check for localStorage data and offer migration on first load
  useIndexMigration(hasMigrated, setHasMigrated);

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

      {/* Floating Version Indicator */}
      <div className="fixed bottom-4 right-4 z-50 px-2 py-1 bg-tactical-surface/80 border border-tactical-border/50 rounded text-xs font-mono text-tactical-text/60 backdrop-blur-sm">
        version 0.1
      </div>
    </div>
  );
};

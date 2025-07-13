import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { StatusBar } from './StatusBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexEffects } from '@/hooks/useIndexEffects';
import { useIndexMigration } from '@/hooks/useIndexMigration';
import { useIndexActions } from '@/hooks/useIndexActions';
import { useVisitTracking } from '@/hooks/useVisitTracking';

// Memoized components to prevent unnecessary re-renders
const MemoizedIndexHeader = React.memo(IndexHeader);
const MemoizedMobileHeader = React.memo(MobileHeader);
const MemoizedIndexMainContent = React.memo(IndexMainContent);
const MemoizedIndexModals = React.memo(IndexModals);
const MemoizedMissionBar = React.memo(MissionBar);
const MemoizedStatusBar = React.memo(StatusBar);

export const OptimizedIndexContainer = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
  // Track page visit with debouncing
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

  // Memoize expensive computations
  const headerProps = useMemo(() => ({
    profileName: profile?.name,
    decisions: localDecisions,
    showArchived,
    error,
    onDecisionClick: handleDecisionClick,
    onQuickAddClick: handleQuickAddClick,
    onJournalClick: handleJournalClick,
    onToggleArchived: handleToggleArchived,
    onLogout: handleLogout
  }), [
    profile?.name,
    localDecisions,
    showArchived,
    error,
    handleDecisionClick,
    handleQuickAddClick,
    handleJournalClick,
    handleToggleArchived,
    handleLogout
  ]);

  const mainContentProps = useMemo(() => ({
    decisions: localDecisions,
    showArchived,
    onDecisionUpdate: handleDecisionUpdate,
    onDecisionClick: handleDecisionClick,
    onArchive: handleArchive,
    onQuickAdd: handleStageQuickAdd
  }), [
    localDecisions,
    showArchived,
    handleDecisionUpdate,
    handleDecisionClick,
    handleArchive,
    handleStageQuickAdd
  ]);

  const modalProps = useMemo(() => ({
    selectedDecision,
    isDetailModalOpen,
    isQuickAddOpen,
    isJournalOpen,
    journalData,
    quickAddStage,
    onCloseDetailModal: handleCloseDetailModal,
    onCloseQuickAdd: handleCloseQuickAdd,
    onCloseJournal: handleCloseJournal,
    onJournalComplete: handleJournalComplete,
    onQuickAdd: handleQuickAdd,
    onDecisionUpdate: handleDecisionUpdate
  }), [
    selectedDecision,
    isDetailModalOpen,
    isQuickAddOpen,
    isJournalOpen,
    journalData,
    quickAddStage,
    handleCloseDetailModal,
    handleCloseQuickAdd,
    handleCloseJournal,
    handleJournalComplete,
    handleQuickAdd,
    handleDecisionUpdate
  ]);

  // Optimized data loading with caching and debouncing
  const loadDecisions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Batch both requests for better performance
      const [decisions, reflections] = await Promise.all([
        secureDecisionService.getDecisions(),
        secureDecisionService.getReflectionsDue()
      ]);
      
      setLocalDecisions(decisions);
      setReflectionsDue(reflections);
      setError(null);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Index: Error fetching data:', err);
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

  // Load data only when user changes
  useEffect(() => {
    if (user?.id) {
      loadDecisions();
    }
  }, [user?.id, loadDecisions]);

  // Early returns for loading and error states
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
        <MemoizedMobileHeader {...headerProps} />
      ) : (
        <MemoizedIndexHeader {...headerProps} />
      )}

      {/* Mission Bar */}
      <MemoizedMissionBar />

      {/* Status Bar */}
      <MemoizedStatusBar decisions={localDecisions} />

      {/* Main Content */}
      <MemoizedIndexMainContent {...mainContentProps} />

      {/* Modals */}
      <MemoizedIndexModals {...modalProps} />
    </div>
  );
};
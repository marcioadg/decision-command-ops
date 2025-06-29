
import { useState, useEffect } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';

export const useIndexState = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalData, setJournalData] = useState<{ title: string; notes: string } | null>(null);
  const [quickAddStage, setQuickAddStage] = useState<DecisionStage | undefined>(undefined);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check for first login on mount
  useEffect(() => {
    const hasShownJournalThisSession = sessionStorage.getItem('journalShownThisSession');
    if (!hasShownJournalThisSession) {
      console.log('useIndexState: First login detected, will show journal');
      setIsFirstLogin(true);
    }
  }, []);

  // Auto-open journal on first login
  useEffect(() => {
    if (isFirstLogin) {
      console.log('useIndexState: Opening journal for first login');
      setIsJournalOpen(true);
      setIsFirstLogin(false);
      // Mark that we've shown the journal this session
      sessionStorage.setItem('journalShownThisSession', 'true');
    }
  }, [isFirstLogin]);

  const handleCloseDetailModal = () => {
    console.log('useIndexState: Closing detail modal');
    setIsDetailModalOpen(false);
    setSelectedDecision(null);
  };

  const handleCloseQuickAdd = () => {
    setIsQuickAddOpen(false);
    setJournalData(null);
    setQuickAddStage(undefined);
  };

  const handleCloseJournal = () => {
    setIsJournalOpen(false);
  };

  const handleDecisionClick = (decision: Decision) => {
    console.log('useIndexState: handleDecisionClick called with decision:', decision.id);
    setSelectedDecision(decision);
    setIsDetailModalOpen(true);
    console.log('useIndexState: Modal state updated - isDetailModalOpen should be true');
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
  };

  const handleQuickAddClick = () => {
    setQuickAddStage(undefined);
    setJournalData(null);
    setIsQuickAddOpen(true);
  };

  const handleJournalClick = () => {
    setIsJournalOpen(true);
  };

  const handleJournalComplete = (data: { title: string; notes: string }) => {
    setJournalData(data);
    setIsJournalOpen(false);
    setIsQuickAddOpen(true);
  };

  const handleStageQuickAdd = (stage: DecisionStage) => {
    setQuickAddStage(stage);
    setJournalData(null);
    setIsQuickAddOpen(true);
  };

  const triggerFirstLoginJournal = () => {
    console.log('useIndexState: Triggering first login journal');
    setIsFirstLogin(true);
  };

  return {
    // State
    selectedDecision,
    isDetailModalOpen,
    isQuickAddOpen,
    showArchived,
    hasMigrated,
    isJournalOpen,
    journalData,
    quickAddStage,
    isFirstLogin,
    // Setters
    setHasMigrated,
    // Handlers
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
  };
};

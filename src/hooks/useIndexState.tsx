
import { useState } from 'react';
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

  const handleCloseDetailModal = () => {
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
    setSelectedDecision(decision);
    setIsDetailModalOpen(true);
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
    handleStageQuickAdd
  };
};


import { DecisionDetailModal } from '@/components/DecisionDetailModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { JournalModal } from '@/components/JournalModal';
import { Decision, DecisionStage } from '@/types/Decision';

interface IndexModalsProps {
  selectedDecision: Decision | null;
  isDetailModalOpen: boolean;
  isQuickAddOpen: boolean;
  isJournalOpen: boolean;
  journalData: { title: string; notes: string } | null;
  quickAddStage: DecisionStage | undefined;
  onCloseDetailModal: () => void;
  onCloseQuickAdd: () => void;
  onCloseJournal: () => void;
  onDecisionUpdate: (decision: Decision) => Promise<void>;
  onQuickAdd: (decision: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  onJournalComplete: (data: { title: string; notes: string }) => void;
  onImmediateDecisionUpdate?: (decision: Decision) => void;
}

export const IndexModals = ({
  selectedDecision,
  isDetailModalOpen,
  isQuickAddOpen,
  isJournalOpen,
  journalData,
  quickAddStage,
  onCloseDetailModal,
  onCloseQuickAdd,
  onCloseJournal,
  onDecisionUpdate,
  onQuickAdd,
  onJournalComplete,
  onImmediateDecisionUpdate
}: IndexModalsProps) => {
  return (
    <>
      <DecisionDetailModal
        decision={selectedDecision}
        isOpen={isDetailModalOpen}
        onClose={onCloseDetailModal}
        onUpdate={onDecisionUpdate}
        onImmediateUpdate={onImmediateDecisionUpdate}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={onCloseQuickAdd}
        onAdd={onQuickAdd}
        preFilledData={{
          title: journalData?.title,
          notes: journalData?.notes,
          stage: quickAddStage
        }}
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={onCloseJournal}
        onComplete={onJournalComplete}
      />
    </>
  );
};

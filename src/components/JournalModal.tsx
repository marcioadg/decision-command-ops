
import { Decision } from '@/types/Decision';
import { JournalForm } from './JournalForm';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (journalData: { title: string; notes: string }) => void;
}

export const JournalModal = ({ isOpen, onClose, onComplete }: JournalModalProps) => {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 w-full max-w-lg mx-4 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-tactical-accent font-tactical">
            TACTICAL JOURNAL
          </h2>
          <button
            onClick={onClose}
            className="text-tactical-text/60 hover:text-tactical-text text-xl"
          >
            ×
          </button>
        </div>

        <JournalForm onComplete={onComplete} onCancel={onClose} />
      </div>
    </div>
  );
};

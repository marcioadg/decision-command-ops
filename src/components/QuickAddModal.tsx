
import { DecisionStage, Decision } from '@/types/Decision';
import { QuickAddForm } from './QuickAddForm';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (decision: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  preFilledData?: {
    title?: string;
    notes?: string;
    stage?: DecisionStage;
  };
}

export const QuickAddModal = ({ isOpen, onClose, onAdd, preFilledData }: QuickAddModalProps) => {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 w-full max-w-md mx-4 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-tactical-accent font-tactical">
            NEW DECISION
          </h2>
          <button
            onClick={onClose}
            className="text-tactical-text/60 hover:text-tactical-text text-xl"
          >
            ×
          </button>
        </div>

        <QuickAddForm onAdd={onAdd} onCancel={onClose} preFilledData={preFilledData} />
      </div>
    </div>
  );
};


interface DecisionModalFooterProps {
  editMode: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const DecisionModalFooter = ({ editMode, onSave, onCancel }: DecisionModalFooterProps) => {
  if (!editMode) {
    return null;
  }

  return (
    <div className="flex space-x-3 p-6 border-t border-tactical-border">
      <button
        onClick={onCancel}
        className="flex-1 bg-tactical-surface border border-tactical-border text-tactical-text py-2 rounded font-mono text-sm hover:bg-tactical-border/50 transition-colors"
      >
        CANCEL
      </button>
      <button
        onClick={onSave}
        className="flex-1 bg-tactical-accent text-tactical-bg py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors"
      >
        SAVE CHANGES
      </button>
    </div>
  );
};

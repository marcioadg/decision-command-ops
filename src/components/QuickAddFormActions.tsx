
interface QuickAddFormActionsProps {
  onCancel: () => void;
  isValid: boolean;
  isSubmitting: boolean;
}

export const QuickAddFormActions = ({ onCancel, isValid, isSubmitting }: QuickAddFormActionsProps) => {
  return (
    <div className="flex space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1 bg-tactical-surface border border-tactical-border text-tactical-text py-2 rounded font-mono text-sm hover:bg-tactical-border/50 transition-colors disabled:opacity-50"
      >
        CANCEL
      </button>
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        onClick={() => console.log('QuickAddFormActions: Submit button clicked', { isValid, isSubmitting })}
        className="flex-1 bg-tactical-accent text-tactical-bg py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'ADDING...' : 'ADD DECISION'}
      </button>
    </div>
  );
};

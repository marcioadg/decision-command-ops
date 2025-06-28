
import { Archive } from 'lucide-react';
import { Decision } from '@/types/Decision';

interface DecisionCardActionsProps {
  decision: Decision;
  onArchive?: (decision: Decision) => void;
}

export const DecisionCardActions = ({ decision, onArchive }: DecisionCardActionsProps) => {
  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(decision);
    }
  };

  if (!onArchive) return null;

  return (
    <button
      onClick={handleArchive}
      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-tactical-surface border border-tactical-border rounded p-1 hover:bg-tactical-accent hover:text-tactical-bg z-10"
      title="Archive decision"
    >
      <Archive className="w-3 h-3" />
    </button>
  );
};

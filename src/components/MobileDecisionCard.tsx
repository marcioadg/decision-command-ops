
import { Decision } from '@/types/Decision';
import { DecisionCardHeader } from './DecisionCardHeader';
import { DecisionCardMetrics } from './DecisionCardMetrics';
import { DecisionCardReflectionStatus } from './DecisionCardReflectionStatus';
import { Archive, ArrowRight, Loader2 } from 'lucide-react';
import { getDaysAgo } from '@/lib/dateUtils';

interface MobileDecisionCardProps {
  decision: Decision;
  onClick: (decision: Decision) => void;
  onMove: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  isUpdating: boolean;
  isOptimistic: boolean;
}

export const MobileDecisionCard = ({
  decision,
  onClick,
  onMove,
  onArchive,
  isUpdating,
  isOptimistic
}: MobileDecisionCardProps) => {
  const handleClick = () => {
    onClick(decision);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(decision);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(decision);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        tactical-card cursor-pointer transition-all duration-200 relative
        ${isOptimistic ? 'ring-2 ring-tactical-accent/50 bg-tactical-accent/5' : ''}
        ${isUpdating ? 'opacity-75' : ''}
        hover:bg-tactical-surface/50 active:scale-[0.98]
      `}
    >
      {/* Loading Indicator */}
      {isUpdating && (
        <div className="absolute top-3 right-3 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-tactical-accent" />
        </div>
      )}

      {/* Header */}
      <DecisionCardHeader title={decision.title} category={decision.category} />

      {/* Metrics */}
      <DecisionCardMetrics
        priority={decision.priority}
        confidence={decision.confidence}
        category={decision.category}
      />

      {/* Notes Preview */}
      {decision.notes && (
        <div className="mt-3 pt-2 border-t border-tactical-border">
          <p className="text-sm text-tactical-text/60 line-clamp-2">
            {decision.notes}
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-tactical-border">
        <div className="text-xs font-mono text-tactical-text/40">
          {getDaysAgo(decision.createdAt)}
        </div>

        <div className="flex items-center space-x-2">
          {/* Archive Button */}
          {onArchive && (
            <button
              onClick={handleArchive}
              className="p-2 rounded-lg bg-tactical-surface border border-tactical-border hover:bg-tactical-accent hover:text-tactical-bg transition-colors"
              title="Archive decision"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}

          {/* Move Button */}
          <button
            onClick={handleMove}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-tactical-accent text-tactical-bg hover:bg-tactical-accent/80 transition-colors font-mono text-xs"
          >
            <span>MOVE</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Reflection Status */}
      <DecisionCardReflectionStatus decision={decision} />
    </div>
  );
};

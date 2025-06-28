
import { Decision } from '@/types/Decision';
import { DecisionCardHeader } from './DecisionCardHeader';
import { DecisionCardMetrics } from './DecisionCardMetrics';
import { DecisionCardReflectionStatus } from './DecisionCardReflectionStatus';
import { DecisionCardActions } from './DecisionCardActions';
import { getDaysAgo } from '@/lib/dateUtils';

interface DecisionCardProps {
  decision: Decision;
  onDragStart: (decision: Decision) => void;
  onDragEnd: () => void;
  onClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  className?: string;
}

export const DecisionCard = ({ decision, onDragStart, onDragEnd, onClick, onArchive, className = "" }: DecisionCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're starting a drag
    if (e.detail === 1) {
      setTimeout(() => {
        if (!e.defaultPrevented) {
          onClick(decision);
        }
      }, 200);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault = () => {}; // Prevent click from firing
    onDragStart(decision);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`tactical-card cursor-pointer hover:scale-[1.02] animate-slide-in transition-all duration-200 relative group ${className}`}
    >
      {/* Archive Button - Top-left */}
      <DecisionCardActions decision={decision} onArchive={onArchive} />

      {/* Title */}
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
          <p className="text-xs text-tactical-text/60 line-clamp-2">
            {decision.notes}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-2 text-xs font-mono text-tactical-text/40">
        {getDaysAgo(decision.createdAt)}
      </div>

      {/* Reflection Status - Moved to end */}
      <DecisionCardReflectionStatus decision={decision} />
    </div>
  );
};

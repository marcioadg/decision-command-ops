
import { Decision, DecisionStage } from '@/types/Decision';
import { MobileDecisionCard } from './MobileDecisionCard';
import { Plus } from 'lucide-react';

interface MobileStageViewProps {
  stage: { key: DecisionStage; label: string; description: string };
  decisions: Decision[];
  onDecisionClick: (decision: Decision) => void;
  onDecisionMove: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  showArchived: boolean;
  updatingDecisions: Set<string>;
  hasOptimisticUpdate: (decisionId: string) => boolean;
}

export const MobileStageView = ({
  stage,
  decisions,
  onDecisionClick,
  onDecisionMove,
  onArchive,
  onQuickAdd,
  showArchived,
  updatingDecisions,
  hasOptimisticUpdate
}: MobileStageViewProps) => {
  const handleQuickAdd = () => {
    if (onQuickAdd) {
      onQuickAdd(stage.key);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stage Header */}
      <div className="p-4 bg-tactical-surface/20 border-b border-tactical-border">
        <h2 className="font-mono font-bold text-tactical-accent text-lg mb-1">
          {stage.label}
        </h2>
        <p className="text-sm text-tactical-text/60 font-mono">
          {stage.description}
        </p>
      </div>

      {/* Decisions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {decisions.length === 0 ? (
          <div className="text-center py-12 text-tactical-text/40 font-mono">
            <div className="text-4xl mb-4">📋</div>
            <p>No {showArchived ? 'archived ' : ''}decisions</p>
            <p className="text-xs mt-1">in {stage.label.toLowerCase()}</p>
          </div>
        ) : (
          decisions.map(decision => {
            const isUpdating = updatingDecisions.has(decision.id);
            const isOptimistic = hasOptimisticUpdate(decision.id);
            
            return (
              <MobileDecisionCard
                key={decision.id}
                decision={decision}
                onClick={onDecisionClick}
                onMove={onDecisionMove}
                onArchive={onArchive}
                isUpdating={isUpdating}
                isOptimistic={isOptimistic}
              />
            );
          })
        )}
      </div>

      {/* Quick Add Button */}
      {onQuickAdd && (
        <div className="p-4 border-t border-tactical-border bg-tactical-surface/20">
          <button
            onClick={handleQuickAdd}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed border-tactical-border hover:border-tactical-accent bg-tactical-surface/20 hover:bg-tactical-accent/5 rounded-lg transition-all duration-200 group"
          >
            <Plus className="w-5 h-5 text-tactical-text/60 group-hover:text-tactical-accent" />
            <span className="font-mono text-sm text-tactical-text/60 group-hover:text-tactical-accent">
              ADD TO {stage.label}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

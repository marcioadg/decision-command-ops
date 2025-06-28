
import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';
import { Plus, Loader2 } from 'lucide-react';

interface StageColumnProps {
  stage: { key: DecisionStage; label: string; description: string };
  decisions: Decision[];
  onDragStart: (decision: Decision) => void;
  onDragEnd: () => void;
  onDrop: (stage: DecisionStage) => void;
  onDecisionClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  isDragActive: boolean;
  showArchived?: boolean;
  updatingDecisions?: Set<string>;
  hasOptimisticUpdate?: (decisionId: string) => boolean;
}

export const StageColumn = ({ 
  stage, 
  decisions, 
  onDragStart, 
  onDragEnd, 
  onDrop,
  onDecisionClick,
  onArchive,
  onQuickAdd,
  isDragActive,
  showArchived = false,
  updatingDecisions = new Set(),
  hasOptimisticUpdate = () => false
}: StageColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(stage.key);
  };

  const handleQuickAdd = () => {
    if (onQuickAdd) {
      onQuickAdd(stage.key);
    }
  };

  const getStageColor = () => {
    switch (stage.key) {
      case 'backlog': return 'border-t-tactical-text/50';
      case 'considering': return 'border-t-gray-500';
      case 'committed': return 'border-t-tactical-accent';
      case 'decided': return 'border-t-impact-high';
      default: return 'border-t-tactical-border';
    }
  };

  const getStageHeaderColor = () => {
    switch (stage.key) {
      case 'backlog': return 'stage-header-backlog';
      case 'considering': return 'stage-header-considering';
      case 'committed': return 'stage-header-committed';
      case 'decided': return 'stage-header-decided';
      default: return 'stage-header';
    }
  };

  return (
    <div
      className={`flex-1 min-w-0 max-w-sm bg-tactical-surface/30 rounded-lg border border-tactical-border border-t-2 ${getStageColor()} transition-all duration-200 ${
        isDragOver ? 'bg-tactical-accent/10 border-tactical-accent' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Stage Header */}
      <div className="p-3 border-b border-tactical-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`stage-header ${getStageHeaderColor()} text-sm`}>{stage.label}</h3>
          <div className="hud-metric text-xs">
            {decisions.length}
            {showArchived && <span className="ml-1 text-tactical-accent">ARCHIVED</span>}
          </div>
        </div>
        <p className="text-xs text-tactical-text/60 font-mono line-clamp-2 h-8 flex items-start">
          {stage.description}
        </p>
      </div>

      {/* Decision Cards */}
      <div className="p-3 space-y-2 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)]">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-tactical-text/40 font-mono text-sm">
            No {showArchived ? 'archived ' : ''}decisions in {stage.label.toLowerCase()}
          </div>
        ) : (
          decisions.map(decision => {
            const isUpdating = updatingDecisions.has(decision.id);
            const isOptimistic = hasOptimisticUpdate(decision.id);
            
            return (
              <div key={decision.id} className="relative">
                <DecisionCard
                  decision={decision}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onClick={onDecisionClick}
                  onArchive={onArchive}
                  className={`
                    ${isOptimistic ? 'ring-2 ring-tactical-accent/50 bg-tactical-accent/5' : ''}
                    ${isUpdating ? 'opacity-75' : ''}
                    transition-all duration-200
                  `}
                />
                {isUpdating && (
                  <div className="absolute top-2 right-2 z-10">
                    <Loader2 className="w-4 h-4 animate-spin text-tactical-accent" />
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* Drop Zone Indicator */}
        {isDragActive && isDragOver && (
          <div className="border-2 border-dashed border-tactical-accent bg-tactical-accent/5 rounded-lg p-4 text-center">
            <span className="text-tactical-accent font-mono text-sm">Drop here</span>
          </div>
        )}
        
        {/* Add Button */}
        {onQuickAdd && (
          <button
            onClick={handleQuickAdd}
            className="w-full border-2 border-dashed border-tactical-border hover:border-tactical-accent bg-tactical-surface/20 hover:bg-tactical-accent/5 rounded-lg p-3 text-center transition-all duration-200 group"
          >
            <div className="flex items-center justify-center space-x-2 text-tactical-text/60 group-hover:text-tactical-accent">
              <Plus className="w-4 h-4" />
              <span className="font-mono text-xs">ADD TO {stage.label}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

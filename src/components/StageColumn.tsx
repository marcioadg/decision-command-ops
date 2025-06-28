
import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';

interface StageColumnProps {
  stage: { key: DecisionStage; label: string; description: string };
  decisions: Decision[];
  onDragStart: (decision: Decision) => void;
  onDragEnd: () => void;
  onDrop: (stage: DecisionStage) => void;
  onDecisionClick: (decision: Decision) => void;
  isDragActive: boolean;
}

export const StageColumn = ({ 
  stage, 
  decisions, 
  onDragStart, 
  onDragEnd, 
  onDrop,
  onDecisionClick,
  isDragActive 
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

  const getStageColor = () => {
    switch (stage.key) {
      case 'backlog': return 'border-t-tactical-text/50';
      case 'considering': return 'border-t-urgency-medium';
      case 'committed': return 'border-t-tactical-accent';
      case 'decided': return 'border-t-impact-high';
      case 'lessons': return 'border-t-info';
      default: return 'border-t-tactical-border';
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
          <h3 className="stage-header text-sm">{stage.label}</h3>
          <div className="hud-metric text-xs">
            {decisions.length}
          </div>
        </div>
        <p className="text-xs text-tactical-text/60 font-mono line-clamp-2">
          {stage.description}
        </p>
      </div>

      {/* Decision Cards */}
      <div className="p-3 space-y-2 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)]">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-tactical-text/40 font-mono text-sm">
            No decisions in {stage.label.toLowerCase()}
          </div>
        ) : (
          decisions.map(decision => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onDecisionClick}
            />
          ))
        )}
        
        {/* Drop Zone Indicator */}
        {isDragActive && isDragOver && (
          <div className="border-2 border-dashed border-tactical-accent bg-tactical-accent/5 rounded-lg p-4 text-center">
            <span className="text-tactical-accent font-mono text-sm">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
};

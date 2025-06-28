
import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';
import { StageColumn } from './StageColumn';
import { soundSystem } from '@/utils/soundSystem';

interface DecisionPipelineProps {
  decisions: Decision[];
  onDecisionUpdate: (decision: Decision) => void;
  onDecisionClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  showArchived?: boolean;
}

const stages: { key: DecisionStage; label: string; description: string }[] = [
  { key: 'backlog', label: 'BACKLOG', description: 'Identified decisions awaiting evaluation' },
  { key: 'considering', label: 'CONSIDERING', description: 'Active analysis and stakeholder input' },
  { key: 'committed', label: 'COMMITTED', description: 'Decision made, execution pending' },
  { key: 'decided', label: 'DECIDED', description: 'Executed decisions with outcomes' }
];

export const DecisionPipeline = ({ 
  decisions, 
  onDecisionUpdate, 
  onDecisionClick, 
  onArchive,
  showArchived = false 
}: DecisionPipelineProps) => {
  const [draggedDecision, setDraggedDecision] = useState<Decision | null>(null);

  const handleDragStart = (decision: Decision) => {
    setDraggedDecision(decision);
  };

  const handleDragEnd = () => {
    setDraggedDecision(null);
  };

  const handleDrop = (stage: DecisionStage) => {
    if (draggedDecision && draggedDecision.stage !== stage) {
      const updatedDecision: Decision = {
        ...draggedDecision,
        stage,
        updatedAt: new Date()
      };
      onDecisionUpdate(updatedDecision);
      soundSystem.playCardDrop();
      
      // Play military celebration sound when moving to "decided" stage
      if (stage === 'decided') {
        soundSystem.playMilitaryCelebration();
      } else {
        soundSystem.playStageTransition();
      }
    }
  };

  const getDecisionsByStage = (stage: DecisionStage) => {
    return decisions.filter(decision => 
      decision.stage === stage && 
      (showArchived ? decision.archived : !decision.archived)
    );
  };

  return (
    <div className="flex gap-3 h-full w-full">
      {stages.map(stage => (
        <StageColumn
          key={stage.key}
          stage={stage}
          decisions={getDecisionsByStage(stage.key)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDecisionClick={onDecisionClick}
          onArchive={onArchive}
          isDragActive={draggedDecision !== null}
          showArchived={showArchived}
        />
      ))}
    </div>
  );
};

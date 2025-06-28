
import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';
import { StageColumn } from './StageColumn';

interface DecisionPipelineProps {
  decisions: Decision[];
  onDecisionUpdate: (decision: Decision) => void;
  onDecisionClick: (decision: Decision) => void;
}

const stages: { key: DecisionStage; label: string; description: string }[] = [
  { key: 'backlog', label: 'BACKLOG', description: 'Identified decisions awaiting evaluation' },
  { key: 'considering', label: 'CONSIDERING', description: 'Active analysis and stakeholder input' },
  { key: 'committed', label: 'COMMITTED', description: 'Decision made, execution pending' },
  { key: 'decided', label: 'DECIDED', description: 'Executed decisions with outcomes' },
  { key: 'lessons', label: 'LESSONS', description: 'Reflections and learnings captured' }
];

export const DecisionPipeline = ({ decisions, onDecisionUpdate, onDecisionClick }: DecisionPipelineProps) => {
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
    }
  };

  const getDecisionsByStage = (stage: DecisionStage) => {
    return decisions.filter(decision => decision.stage === stage);
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
          isDragActive={draggedDecision !== null}
        />
      ))}
    </div>
  );
};

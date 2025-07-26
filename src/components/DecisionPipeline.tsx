import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';
import { StageColumn } from './StageColumn';
import { ConnectionStatus } from './ConnectionStatus';
import { ConnectionStatusMonitor } from './ConnectionStatusMonitor';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';
interface DecisionPipelineProps {
  decisions: Decision[];
  onDecisionUpdate: (decision: Decision) => Promise<void>;
  onDecisionClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  showArchived?: boolean;
  isRealTimeConnected?: boolean;
  onRetryConnection?: () => void;
}
const stages: {
  key: DecisionStage;
  label: string;
  description: string;
}[] = [{
  key: 'backlog',
  label: 'BACKLOG',
  description: 'Identified decisions awaiting evaluation'
}, {
  key: 'considering',
  label: 'CONSIDERING',
  description: 'Active analysis and stakeholder input'
}, {
  key: 'committed',
  label: 'COMMITTED',
  description: 'Decision made, execution pending'
}, {
  key: 'executed',
  label: 'EXECUTED',
  description: 'Executed decisions with outcomes'
}];
export const DecisionPipeline = ({
  decisions,
  onDecisionUpdate,
  onDecisionClick,
  onArchive,
  onQuickAdd,
  showArchived = false,
  isRealTimeConnected = false,
  onRetryConnection
}: DecisionPipelineProps) => {
  const [draggedDecision, setDraggedDecision] = useState<Decision | null>(null);
  const [updatingDecisions, setUpdatingDecisions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const handleDragStart = (decision: Decision) => {
    setDraggedDecision(decision);
  };
  const handleDragEnd = () => {
    setDraggedDecision(null);
  };
  const handleDrop = async (stage: DecisionStage) => {
    if (!draggedDecision || draggedDecision.stage === stage) return;
    const decisionId = draggedDecision.id;
    const originalStage = draggedDecision.stage;
    console.log('DecisionPipeline: Starting drag drop operation:', {
      decisionId,
      originalStage,
      newStage: stage,
      isRealTimeConnected,
      draggedDecision: draggedDecision.title
    });

    setUpdatingDecisions(prev => new Set(prev).add(decisionId));

    // Play immediate sound feedback
    soundSystem.playCardDrop();
    try {
      // Update the decision object with new stage
      const updatedDecision: Decision = {
        ...draggedDecision,
        stage,
        updatedAt: new Date()
      };
      console.log('DecisionPipeline: Calling onDecisionUpdate with:', updatedDecision);

      // Perform the actual database update
      await onDecisionUpdate(updatedDecision);
      console.log('DecisionPipeline: Database update successful for decision:', decisionId);

      // Play celebration sound for "decided" stage
      if (stage === 'executed') {
        soundSystem.playMilitaryCelebration();
      } else {
        soundSystem.playStageTransition();
      }
    } catch (error) {
      console.error('DecisionPipeline: Failed to update decision:', error);

      toast({
        title: "Update Failed",
        description: `Failed to move "${draggedDecision.title}" to ${stage}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setUpdatingDecisions(prev => {
        const next = new Set(prev);
        next.delete(decisionId);
        return next;
      });
    }
  };
  const getDecisionsByStage = (stage: DecisionStage) => {
    // Temporary fix: handle both 'decided' and 'executed' for backward compatibility
    if (stage === 'executed') {
      return decisions.filter(decision => 
        (decision.stage === stage || (decision.stage as any) === 'decided') && 
        (showArchived ? decision.archived : !decision.archived)
      );
    }
    return decisions.filter(decision => decision.stage === stage && (showArchived ? decision.archived : !decision.archived));
  };
  return <div className="w-full max-w-7xl mx-auto px-4">
      {/* Real-time connection status indicator with improved monitoring */}
      

      <div className="flex gap-3 h-full">
        {stages.map(stage => <StageColumn key={stage.key} stage={stage} decisions={getDecisionsByStage(stage.key)} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} onDecisionClick={onDecisionClick} onArchive={onArchive} onQuickAdd={onQuickAdd} isDragActive={draggedDecision !== null} showArchived={showArchived} updatingDecisions={updatingDecisions} />)}
      </div>
    </div>;
};
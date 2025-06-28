
import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { DecisionCard } from './DecisionCard';
import { StageColumn } from './StageColumn';
import { soundSystem } from '@/utils/soundSystem';
import { useOptimisticDecisions } from '@/hooks/useOptimisticDecisions';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff } from 'lucide-react';

interface DecisionPipelineProps {
  decisions: Decision[];
  onDecisionUpdate: (decision: Decision) => Promise<void>;
  onDecisionClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  showArchived?: boolean;
  isRealTimeConnected?: boolean;
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
  onQuickAdd,
  showArchived = false,
  isRealTimeConnected = false
}: DecisionPipelineProps) => {
  const [draggedDecision, setDraggedDecision] = useState<Decision | null>(null);
  const [updatingDecisions, setUpdatingDecisions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const {
    optimisticDecisions,
    applyOptimisticUpdate,
    removeOptimisticUpdate,
    rollbackOptimisticUpdate,
    hasOptimisticUpdate
  } = useOptimisticDecisions(decisions);

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
      isRealTimeConnected
    });

    // Apply optimistic update immediately
    applyOptimisticUpdate(decisionId, stage);
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
      
      // With the new immediate sync system, updates will appear instantly
      // Real-time subscription will confirm the changes or handle any conflicts
      
      // Play celebration sound for "decided" stage
      if (stage === 'decided') {
        soundSystem.playMilitaryCelebration();
      } else {
        soundSystem.playStageTransition();
      }
    } catch (error) {
      console.error('DecisionPipeline: Failed to update decision:', error);
      
      // Rollback optimistic update on failure
      rollbackOptimisticUpdate(decisionId);
      
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
    return optimisticDecisions.filter(decision => 
      decision.stage === stage && 
      (showArchived ? decision.archived : !decision.archived)
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Real-time connection status indicator */}
      <div className="flex items-center justify-end mb-2">
        <div className={`flex items-center space-x-1 text-xs font-mono ${
          isRealTimeConnected ? 'text-impact-high' : 'text-tactical-text/40'
        }`}>
          {isRealTimeConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 h-full">
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
            onQuickAdd={onQuickAdd}
            isDragActive={draggedDecision !== null}
            showArchived={showArchived}
            updatingDecisions={updatingDecisions}
            hasOptimisticUpdate={hasOptimisticUpdate}
          />
        ))}
      </div>
    </div>
  );
};


import { useState } from 'react';
import { Decision, DecisionStage } from '@/types/Decision';
import { MobileStageView } from './MobileStageView';
import { MobileStageNavigation } from './MobileStageNavigation';
import { MoveDecisionSheet } from './MoveDecisionSheet';
import { ConnectionStatus } from './ConnectionStatus';
import { useOptimisticDecisions } from '@/hooks/useOptimisticDecisions';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';

interface MobilePipelineProps {
  decisions: Decision[];
  onDecisionUpdate: (decision: Decision) => Promise<void>;
  onDecisionClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  showArchived?: boolean;
  isRealTimeConnected?: boolean;
  onRetryConnection?: () => void;
}

const stages: { key: DecisionStage; label: string; description: string }[] = [
  { key: 'backlog', label: 'BACKLOG', description: 'Identified decisions awaiting evaluation' },
  { key: 'considering', label: 'CONSIDERING', description: 'Active analysis and stakeholder input' },
  { key: 'committed', label: 'COMMITTED', description: 'Decision made, execution pending' },
  { key: 'decided', label: 'DECIDED', description: 'Executed decisions with outcomes' }
];

export const MobilePipeline = ({
  decisions,
  onDecisionUpdate,
  onDecisionClick,
  onArchive,
  onQuickAdd,
  showArchived = false,
  isRealTimeConnected = false,
  onRetryConnection
}: MobilePipelineProps) => {
  const [activeStage, setActiveStage] = useState<DecisionStage>('backlog');
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isMoveSheetOpen, setIsMoveSheetOpen] = useState(false);
  const [updatingDecisions, setUpdatingDecisions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const {
    optimisticDecisions,
    applyOptimisticUpdate,
    rollbackOptimisticUpdate,
    hasOptimisticUpdate
  } = useOptimisticDecisions(decisions);

  const getDecisionsByStage = (stage: DecisionStage) => {
    return optimisticDecisions.filter(decision => 
      decision.stage === stage && 
      (showArchived ? decision.archived : !decision.archived)
    );
  };

  const handleMoveDecision = async (decision: Decision, newStage: DecisionStage) => {
    if (decision.stage === newStage) return;

    const decisionId = decision.id;
    const originalStage = decision.stage;

    console.log('MobilePipeline: Moving decision:', {
      decisionId,
      originalStage,
      newStage,
      isRealTimeConnected
    });

    // Apply optimistic update immediately
    applyOptimisticUpdate(decisionId, newStage);
    setUpdatingDecisions(prev => new Set(prev).add(decisionId));

    // Play sound feedback
    soundSystem.playCardDrop();

    try {
      const updatedDecision: Decision = {
        ...decision,
        stage: newStage,
        updatedAt: new Date()
      };

      await onDecisionUpdate(updatedDecision);
      
      // Play celebration sound for "decided" stage
      if (newStage === 'decided') {
        soundSystem.playMilitaryCelebration();
      } else {
        soundSystem.playStageTransition();
      }

      setIsMoveSheetOpen(false);
      setSelectedDecision(null);
    } catch (error) {
      console.error('MobilePipeline: Failed to update decision:', error);
      
      rollbackOptimisticUpdate(decisionId);
      
      toast({
        title: "Update Failed",
        description: `Failed to move "${decision.title}" to ${newStage}. Please try again.`,
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

  const handleDecisionMove = (decision: Decision) => {
    setSelectedDecision(decision);
    setIsMoveSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="flex items-center justify-end p-2">
        <ConnectionStatus 
          isConnected={isRealTimeConnected} 
          onRetry={onRetryConnection}
        />
      </div>

      {/* Stage Navigation */}
      <MobileStageNavigation
        stages={stages}
        activeStage={activeStage}
        onStageChange={setActiveStage}
        decisions={optimisticDecisions}
        showArchived={showArchived}
      />

      {/* Active Stage View */}
      <div className="flex-1 overflow-hidden">
        <MobileStageView
          stage={stages.find(s => s.key === activeStage)!}
          decisions={getDecisionsByStage(activeStage)}
          onDecisionClick={onDecisionClick}
          onDecisionMove={handleDecisionMove}
          onArchive={onArchive}
          onQuickAdd={onQuickAdd}
          showArchived={showArchived}
          updatingDecisions={updatingDecisions}
          hasOptimisticUpdate={hasOptimisticUpdate}
        />
      </div>

      {/* Move Decision Sheet */}
      <MoveDecisionSheet
        decision={selectedDecision}
        stages={stages}
        isOpen={isMoveSheetOpen}
        onClose={() => {
          setIsMoveSheetOpen(false);
          setSelectedDecision(null);
        }}
        onMove={handleMoveDecision}
      />
    </div>
  );
};


import { DecisionPipeline } from '@/components/DecisionPipeline';
import { MobilePipeline } from '@/components/MobilePipeline';
import { Decision, DecisionStage } from '@/types/Decision';
import { useIsMobile } from '@/hooks/use-mobile';

interface IndexMainContentProps {
  decisions: Decision[];
  showArchived: boolean;
  onDecisionUpdate: (decision: Decision) => Promise<void>;
  onDecisionClick: (decision: Decision) => void;
  onArchive: (decision: Decision) => void;
  onQuickAdd?: (stage: DecisionStage) => void;
  isRealTimeConnected?: boolean;
}

export const IndexMainContent = ({
  decisions,
  showArchived,
  onDecisionUpdate,
  onDecisionClick,
  onArchive,
  onQuickAdd,
  isRealTimeConnected = false
}: IndexMainContentProps) => {
  const isMobile = useIsMobile();

  return (
    <main className="flex-1 p-4">
      {isMobile ? (
        <MobilePipeline
          decisions={decisions}
          onDecisionUpdate={onDecisionUpdate}
          onDecisionClick={onDecisionClick}
          onArchive={onArchive}
          onQuickAdd={onQuickAdd}
          showArchived={showArchived}
          isRealTimeConnected={isRealTimeConnected}
        />
      ) : (
        <DecisionPipeline
          decisions={decisions}
          onDecisionUpdate={onDecisionUpdate}
          onDecisionClick={onDecisionClick}
          onArchive={onArchive}
          onQuickAdd={onQuickAdd}
          showArchived={showArchived}
          isRealTimeConnected={isRealTimeConnected}
        />
      )}
    </main>
  );
};

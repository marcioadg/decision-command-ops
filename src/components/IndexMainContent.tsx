
import { DecisionPipeline } from '@/components/DecisionPipeline';
import { StatusBar } from '@/components/StatusBar';
import { Decision } from '@/types/Decision';

interface IndexMainContentProps {
  decisions: Decision[];
  showArchived: boolean;
  onDecisionUpdate: (decision: Decision) => void;
  onDecisionClick: (decision: Decision) => void;
  onArchive: (decision: Decision) => void;
}

export const IndexMainContent = ({
  decisions,
  showArchived,
  onDecisionUpdate,
  onDecisionClick,
  onArchive
}: IndexMainContentProps) => {
  return (
    <>
      {/* Main Content */}
      <main className="flex-1 p-4">
        <DecisionPipeline
          decisions={decisions}
          onDecisionUpdate={onDecisionUpdate}
          onDecisionClick={onDecisionClick}
          onArchive={onArchive}
          showArchived={showArchived}
        />
      </main>

      {/* Status Bar */}
      <StatusBar decisions={decisions} />
    </>
  );
};

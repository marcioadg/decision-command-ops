
import { Decision } from '@/types/Decision';

interface DecisionTimestampsProps {
  decision: Decision;
}

export const DecisionTimestamps = ({ decision }: DecisionTimestampsProps) => {
  return (
    <div className="pt-4 border-t border-tactical-border">
      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-tactical-text/60">
        <div>
          <span className="text-tactical-text/40">Created:</span>
          <br />
          {decision.createdAt.toLocaleString()}
        </div>
        {decision.updatedAt && (
          <div>
            <span className="text-tactical-text/40">Updated:</span>
            <br />
            {decision.updatedAt.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

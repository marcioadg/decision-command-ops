
import { Decision } from '@/types/Decision';

interface DecisionTimestampsProps {
  decision: Decision;
}

export const DecisionTimestamps = ({ decision }: DecisionTimestampsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-tactical-border">
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-1 uppercase">Created</label>
        <p className="text-tactical-text/60 font-mono text-sm">
          {decision.createdAt.toLocaleDateString()} {decision.createdAt.toLocaleTimeString()}
        </p>
      </div>
      {decision.updatedAt && (
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-1 uppercase">Last Updated</label>
          <p className="text-tactical-text/60 font-mono text-sm">
            {decision.updatedAt.toLocaleDateString()} {decision.updatedAt.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

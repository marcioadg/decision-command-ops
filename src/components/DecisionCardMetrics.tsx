
import { Clock } from 'lucide-react';
import { DecisionUrgency, DecisionImpact } from '@/types/Decision';

interface DecisionCardMetricsProps {
  urgency: DecisionUrgency;
  confidence: number;
  impact: DecisionImpact;
  owner: string;
}

export const DecisionCardMetrics = ({ urgency, confidence, impact, owner }: DecisionCardMetricsProps) => {
  const getUrgencyIcon = () => {
    const baseClasses = "w-4 h-4";
    switch (urgency) {
      case 'high': return <Clock className={`${baseClasses} text-urgency-high`} />;
      case 'medium': return <Clock className={`${baseClasses} text-urgency-medium`} />;
      case 'low': return <Clock className={`${baseClasses} text-urgency-low`} />;
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-impact-high bg-impact-high/20';
    if (confidence >= 60) return 'text-urgency-medium bg-urgency-medium/20';
    if (confidence >= 40) return 'text-tactical-accent bg-tactical-accent/20';
    return 'text-urgency-high bg-urgency-high/20';
  };

  return (
    <>
      {/* Metrics Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Urgency */}
          <div className="flex items-center space-x-1">
            {getUrgencyIcon()}
            <span className="text-xs font-mono text-tactical-text/70">
              {urgency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className={`px-2 py-1 rounded text-xs font-mono ${getConfidenceColor()}`}>
          {confidence}%
        </div>
      </div>

      {/* Impact and Owner */}
      <div className="flex items-center justify-between text-xs">
        <div className="hud-metric">
          IMPACT: {impact.toUpperCase()}
        </div>
        <div className="hud-metric">
          {owner}
        </div>
      </div>
    </>
  );
};

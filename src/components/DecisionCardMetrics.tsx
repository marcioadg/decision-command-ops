
import { Clock, Star } from 'lucide-react';
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

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < confidence ? 'text-tactical-accent fill-tactical-accent' : 'text-tactical-text/30'
        }`}
      />
    ));
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
        <div className="flex items-center space-x-1">
          {renderStars()}
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

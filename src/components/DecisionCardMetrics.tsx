
import { Clock, Fire } from 'lucide-react';
import { DecisionUrgency, DecisionImpact, DecisionCategory } from '@/types/Decision';

interface DecisionCardMetricsProps {
  urgency: DecisionUrgency;
  confidence: number;
  impact: DecisionImpact;
  category: DecisionCategory;
}

export const DecisionCardMetrics = ({ urgency, confidence, impact, category }: DecisionCardMetricsProps) => {
  const getCategoryBadgeColor = () => {
    switch (category) {
      case 'People': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Capital': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Strategy': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Product': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Timing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Personal': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  const getUrgencyIcon = () => {
    const baseClasses = "w-4 h-4";
    switch (urgency) {
      case 'high': return <Clock className={`${baseClasses} text-urgency-high`} />;
      case 'medium': return <Clock className={`${baseClasses} text-urgency-medium`} />;
      case 'low': return <Clock className={`${baseClasses} text-urgency-low`} />;
    }
  };

  const getImpactIcon = () => {
    const baseClasses = "w-4 h-4";
    switch (impact) {
      case 'high': return <Fire className={`${baseClasses} text-impact-high`} />;
      case 'medium': return <Fire className={`${baseClasses} text-urgency-medium`} />;
      case 'low': return <Fire className={`${baseClasses} text-tactical-text/60`} />;
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
      {/* Category Badge */}
      <div className="flex justify-start mb-3">
        <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
          {category}
        </span>
      </div>

      {/* Horizontal Metrics Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Urgency */}
        <div className="flex items-center space-x-1">
          {getUrgencyIcon()}
          <span className="font-mono text-tactical-text/70">
            {urgency.toUpperCase()}
          </span>
        </div>

        {/* Impact */}
        <div className="flex items-center space-x-1">
          {getImpactIcon()}
          <span className="font-mono text-tactical-text/70">
            {impact.toUpperCase()}
          </span>
        </div>

        {/* Confidence */}
        <div className={`px-2 py-1 rounded font-mono ${getConfidenceColor()}`}>
          {confidence}%
        </div>
      </div>
    </>
  );
};

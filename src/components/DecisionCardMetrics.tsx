
import { Flame } from 'lucide-react';
import { DecisionPriority, DecisionCategory } from '@/types/Decision';

interface DecisionCardMetricsProps {
  priority: DecisionPriority;
  confidence: number;
  category: DecisionCategory;
}

export const DecisionCardMetrics = ({ priority, confidence, category }: DecisionCardMetricsProps) => {
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

  const getPriorityIcon = () => {
    const baseClasses = "w-3 h-3";
    switch (priority) {
      case 'high': return <Flame className={`${baseClasses} text-urgency-high`} />;
      case 'medium': return <Flame className={`${baseClasses} text-urgency-medium`} />;
      case 'low': return <Flame className={`${baseClasses} text-tactical-text/60`} />;
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-impact-high bg-impact-high/20';
    if (confidence >= 60) return 'text-urgency-medium bg-urgency-medium/20';
    if (confidence >= 40) return 'text-tactical-accent bg-tactical-accent/20';
    return 'text-urgency-high bg-urgency-high/20';
  };

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      {/* Category Badge */}
      <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
        {category}
      </span>

      {/* Priority and Confidence Row */}
      <div className="flex items-center gap-3">
        {/* Priority */}
        <div className="flex items-center space-x-1">
          {getPriorityIcon()}
          <span className="font-mono text-tactical-text/70 text-xs">
            {priority.toUpperCase()}
          </span>
        </div>

        {/* Confidence */}
        <div className={`px-2 py-1 rounded font-mono text-xs ${getConfidenceColor()}`}>
          {confidence}%
        </div>
      </div>
    </div>
  );
};


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
      case 'People': return 'bg-gray-500/20 text-gray-400 border-blue-500/50';
      case 'Capital': return 'bg-gray-500/20 text-gray-400 border-green-500/50';
      case 'Strategy': return 'bg-gray-500/20 text-gray-400 border-purple-500/50';
      case 'Product': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'Timing': return 'bg-gray-500/20 text-gray-400 border-yellow-500/50';
      case 'Personal': return 'bg-gray-500/20 text-gray-400 border-pink-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityIcon = () => {
    const baseClasses = "w-3 h-3 text-gray-400";
    return <Flame className={baseClasses} />;
  };

  const getConfidenceColor = () => {
    return 'text-gray-400 bg-gray-500/20';
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
          <span className="font-mono text-gray-400 text-xs">
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

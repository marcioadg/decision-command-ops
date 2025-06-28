
import { Decision } from '@/types/Decision';
import { Clock, Star } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  onDragStart: (decision: Decision) => void;
  onDragEnd: () => void;
}

export const DecisionCard = ({ decision, onDragStart, onDragEnd }: DecisionCardProps) => {
  const getImpactColor = () => {
    switch (decision.impact) {
      case 'high': return 'border-l-impact-high';
      case 'medium': return 'border-l-impact-medium';
      case 'low': return 'border-l-impact-low';
    }
  };

  const getUrgencyIcon = () => {
    const baseClasses = "w-4 h-4";
    switch (decision.urgency) {
      case 'high': return <Clock className={`${baseClasses} text-urgency-high`} />;
      case 'medium': return <Clock className={`${baseClasses} text-urgency-medium`} />;
      case 'low': return <Clock className={`${baseClasses} text-urgency-low`} />;
    }
  };

  const getCategoryBadgeColor = () => {
    switch (decision.category) {
      case 'People': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Capital': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Strategy': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Product': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Timing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Personal': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < decision.confidence ? 'text-tactical-accent fill-tactical-accent' : 'text-tactical-text/30'
        }`}
      />
    ));
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(decision)}
      onDragEnd={onDragEnd}
      className={`tactical-card border-l-4 ${getImpactColor()} cursor-move hover:scale-[1.02] animate-slide-in`}
    >
      {/* Title and Category */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-sm text-tactical-text leading-tight flex-1 mr-2">
          {decision.title}
        </h4>
        <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
          {decision.category}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Urgency */}
          <div className="flex items-center space-x-1">
            {getUrgencyIcon()}
            <span className="text-xs font-mono text-tactical-text/70">
              {decision.urgency.toUpperCase()}
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
          IMPACT: {decision.impact.toUpperCase()}
        </div>
        <div className="hud-metric">
          {decision.owner}
        </div>
      </div>

      {/* Notes Preview */}
      {decision.notes && (
        <div className="mt-3 pt-2 border-t border-tactical-border">
          <p className="text-xs text-tactical-text/60 line-clamp-2">
            {decision.notes}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-2 text-xs font-mono text-tactical-text/40">
        {decision.createdAt.toLocaleDateString()}
      </div>
    </div>
  );
};

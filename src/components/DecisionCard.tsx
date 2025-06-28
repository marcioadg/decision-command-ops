
import { Decision } from '@/types/Decision';
import { Clock, Star, Archive, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  onDragStart: (decision: Decision) => void;
  onDragEnd: () => void;
  onClick: (decision: Decision) => void;
  onArchive?: (decision: Decision) => void;
}

export const DecisionCard = ({ decision, onDragStart, onDragEnd, onClick, onArchive }: DecisionCardProps) => {
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

  const getReflectionStatus = () => {
    if (!decision.reflection) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const intervals = [
      { data: decision.reflection.sevenDay, name: '7-day' },
      { data: decision.reflection.thirtyDay, name: '30-day' },
      { data: decision.reflection.ninetyDay, name: '90-day' }
    ].filter(interval => interval.data);

    if (intervals.length === 0) return null;

    // Find the most urgent status
    let mostUrgent = { status: 'completed', interval: null, daysUntil: Infinity };

    intervals.forEach(({ data, name }) => {
      if (!data) return;
      
      if (data.completed) return; // Skip completed reflections
      
      const dueDate = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate());
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0 && mostUrgent.status !== 'overdue') {
        mostUrgent = { status: 'overdue', interval: name, daysUntil };
      } else if (daysUntil === 0 && mostUrgent.status !== 'overdue') {
        mostUrgent = { status: 'due-today', interval: name, daysUntil };
      } else if (daysUntil > 0 && daysUntil < mostUrgent.daysUntil && mostUrgent.status === 'completed') {
        mostUrgent = { status: 'due-soon', interval: name, daysUntil };
      }
    });

    if (mostUrgent.status === 'completed') {
      // All reflections are completed
      const completedCount = intervals.filter(({ data }) => data?.completed).length;
      return {
        type: 'complete',
        color: 'text-green-400',
        text: `${completedCount}/${intervals.length} COMPLETE`,
        icon: MessageSquare
      };
    }

    const statusConfig = {
      'overdue': {
        type: 'overdue',
        color: 'text-red-400',
        text: `${mostUrgent.interval?.toUpperCase()} OVERDUE`,
        icon: AlertTriangle
      },
      'due-today': {
        type: 'due-today',
        color: 'text-yellow-400',
        text: `${mostUrgent.interval?.toUpperCase()} DUE TODAY`,
        icon: Clock
      },
      'due-soon': {
        type: 'due-soon',
        color: 'text-blue-400',
        text: `${mostUrgent.interval?.toUpperCase()} IN ${mostUrgent.daysUntil}D`,
        icon: Calendar
      }
    };

    return statusConfig[mostUrgent.status as keyof typeof statusConfig] || null;
  };

  const reflectionStatus = getReflectionStatus();

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're starting a drag
    if (e.detail === 1) {
      setTimeout(() => {
        if (!e.defaultPrevented) {
          onClick(decision);
        }
      }, 200);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault = () => {}; // Prevent click from firing
    onDragStart(decision);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(decision);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className="tactical-card cursor-pointer hover:scale-[1.02] animate-slide-in transition-all duration-200 relative group"
    >
      {/* Archive Button - Top-left */}
      {onArchive && (
        <button
          onClick={handleArchive}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-tactical-surface border border-tactical-border rounded p-1 hover:bg-tactical-accent hover:text-tactical-bg z-10"
          title="Archive decision"
        >
          <Archive className="w-3 h-3" />
        </button>
      )}

      {/* Reflection Indicator - Top-right */}
      {reflectionStatus && (
        <div 
          className={`absolute top-2 right-2 ${reflectionStatus.color}`}
          title={`Reflection ${reflectionStatus.type}`}
        >
          <reflectionStatus.icon className="w-4 h-4" />
        </div>
      )}

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

      {/* Reflection Preview */}
      {reflectionStatus && (
        <div className="mt-2 pt-2 border-t border-tactical-border">
          <div className={`flex items-center space-x-1 text-xs ${reflectionStatus.color}`}>
            <reflectionStatus.icon className="w-3 h-3" />
            <span className="font-mono">
              {reflectionStatus.text}
            </span>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-2 text-xs font-mono text-tactical-text/40">
        {decision.createdAt.toLocaleDateString()}
      </div>
    </div>
  );
};

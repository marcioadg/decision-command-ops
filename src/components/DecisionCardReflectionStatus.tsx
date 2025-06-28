
import { Clock, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { Decision } from '@/types/Decision';

interface DecisionCardReflectionStatusProps {
  decision: Decision;
}

export const DecisionCardReflectionStatus = ({ decision }: DecisionCardReflectionStatusProps) => {
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

  if (!reflectionStatus) return null;

  return (
    <>
      {/* Reflection Indicator - Top-right */}
      <div 
        className={`absolute top-2 right-2 ${reflectionStatus.color}`}
        title={`Reflection ${reflectionStatus.type}`}
      >
        <reflectionStatus.icon className="w-4 h-4" />
      </div>

      {/* Reflection Preview */}
      <div className="mt-2 pt-2 border-t border-tactical-border">
        <div className={`flex items-center space-x-1 text-xs ${reflectionStatus.color}`}>
          <reflectionStatus.icon className="w-3 h-3" />
          <span className="font-mono">
            {reflectionStatus.text}
          </span>
        </div>
      </div>
    </>
  );
};

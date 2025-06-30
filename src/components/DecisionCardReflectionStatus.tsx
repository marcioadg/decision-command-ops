
import { Clock, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { Decision } from '@/types/Decision';

interface DecisionCardReflectionStatusProps {
  decision: Decision;
}

export const DecisionCardReflectionStatus = ({ decision }: DecisionCardReflectionStatusProps) => {
  const getReflectionStatus = () => {
    if (!decision.reflection?.thirtyDay) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reflection = decision.reflection.thirtyDay;

    if (reflection.completed) {
      return {
        type: 'complete',
        color: 'text-gray-400',
        text: 'REFLECTION COMPLETE',
        icon: MessageSquare
      };
    }

    const dueDate = new Date(reflection.date.getFullYear(), reflection.date.getMonth(), reflection.date.getDate());
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return {
        type: 'overdue',
        color: 'text-gray-500',
        text: 'REFLECTION OVERDUE',
        icon: AlertTriangle
      };
    } else if (daysUntil === 0) {
      return {
        type: 'due-today',
        color: 'text-gray-600',
        text: 'REFLECTION DUE TODAY',
        icon: Clock
      };
    } else {
      return {
        type: 'due-soon',
        color: 'text-gray-400',
        text: `REFLECTION IN ${daysUntil}D`,
        icon: Calendar
      };
    }
  };

  const reflectionStatus = getReflectionStatus();

  if (!reflectionStatus) return null;

  return (
    <div className="mt-2 pt-2 border-t border-tactical-border">
      <div className={`flex items-center space-x-1 text-xs ${reflectionStatus.color}`}>
        <reflectionStatus.icon className="w-3 h-3" />
        <span className="font-mono">
          {reflectionStatus.text}
        </span>
      </div>
    </div>
  );
};

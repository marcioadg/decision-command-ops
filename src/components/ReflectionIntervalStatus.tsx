
import { ReflectionInterval as ReflectionIntervalType } from '@/types/Decision';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ReflectionIntervalStatusProps {
  data: ReflectionIntervalType | undefined;
}

export const ReflectionIntervalStatus = ({ data }: ReflectionIntervalStatusProps) => {
  const getIntervalStatus = (interval: ReflectionIntervalType | undefined) => {
    if (!interval) return { status: 'not-set', color: 'text-tactical-text/40', icon: Calendar };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(interval.date.getFullYear(), interval.date.getMonth(), interval.date.getDate());
    
    if (interval.completed) {
      return { status: 'completed', color: 'text-green-400', icon: CheckCircle };
    }
    
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { status: 'overdue', color: 'text-red-400', icon: AlertTriangle };
    } else if (daysUntil === 0) {
      return { status: 'due-today', color: 'text-yellow-400', icon: Clock };
    } else {
      return { status: 'scheduled', color: 'text-blue-400', icon: Calendar };
    }
  };

  const formatDueDate = (interval: ReflectionIntervalType | undefined) => {
    if (!interval) return 'Not scheduled';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(interval.date.getFullYear(), interval.date.getMonth(), interval.date.getDate());
    
    if (interval.completed) {
      return 'Completed';
    }
    
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} days overdue`;
    } else if (daysUntil === 0) {
      return 'Due today';
    } else if (daysUntil === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntil} days`;
    }
  };

  const status = getIntervalStatus(data);
  const StatusIcon = status.icon;

  return {
    status,
    StatusIcon,
    formattedDate: formatDueDate(data)
  };
};

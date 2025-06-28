
import { ReflectionInterval as ReflectionIntervalType } from '@/types/Decision';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ReflectionIntervalProps {
  intervalKey: '7-day' | '30-day' | '90-day';
  label: string;
  description: string;
  data: ReflectionIntervalType | undefined;
  defaultDays: number;
  createdAt: Date;
  editMode: boolean;
  onUpdate: (updates: Partial<ReflectionIntervalType>) => void;
}

export const ReflectionInterval = ({ 
  intervalKey, 
  label, 
  description, 
  data, 
  defaultDays, 
  createdAt, 
  editMode, 
  onUpdate 
}: ReflectionIntervalProps) => {
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

  const calculateDefaultDate = (days: number) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + days);
    return date;
  };

  const status = getIntervalStatus(data);
  const StatusIcon = status.icon;

  return (
    <div className="border border-tactical-border/30 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <h4 className="font-mono text-sm font-semibold text-tactical-text">{label}</h4>
          <span className="text-xs text-tactical-text/60">({description})</span>
        </div>
        <span className={`text-xs font-mono ${status.color}`}>
          {formatDueDate(data)}
        </span>
      </div>

      {/* Date Setting */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-1">Due Date</label>
          {editMode ? (
            <input
              type="date"
              value={data?.date ? data.date.toISOString().split('T')[0] : calculateDefaultDate(defaultDays).toISOString().split('T')[0]}
              onChange={(e) => onUpdate({ date: new Date(e.target.value) })}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-2 py-1 text-tactical-text text-xs focus:border-tactical-accent focus:outline-none"
            />
          ) : (
            <p className="text-xs text-tactical-text/80">
              {data?.date ? data.date.toLocaleDateString() : calculateDefaultDate(defaultDays).toLocaleDateString()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-1">Status</label>
          {editMode ? (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data?.completed || false}
                onChange={(e) => onUpdate({ completed: e.target.checked })}
                className="rounded border-tactical-border"
              />
              <span className="text-xs text-tactical-text/80">Mark as completed</span>
            </label>
          ) : (
            <p className={`text-xs font-mono ${status.color}`}>
              {status.status.toUpperCase().replace('-', ' ')}
            </p>
          )}
        </div>
      </div>

      {/* Reflection Notes */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-1">Reflection Notes</label>
        {editMode ? (
          <textarea
            value={data?.answers?.join('\n\n') || ''}
            onChange={(e) => onUpdate({ 
              answers: e.target.value.split('\n\n').filter(a => a.trim()) 
            })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-2 py-1 text-tactical-text text-xs focus:border-tactical-accent focus:outline-none h-20 resize-none"
            placeholder={`Your ${defaultDays}-day reflection insights...`}
          />
        ) : (
          <div className="text-tactical-text/80 text-xs whitespace-pre-wrap">
            {data?.answers?.length 
              ? data.answers.join('\n\n')
              : 'No reflection notes yet'
            }
          </div>
        )}
      </div>
    </div>
  );
};

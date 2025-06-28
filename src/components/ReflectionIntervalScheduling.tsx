
import { ReflectionInterval as ReflectionIntervalType } from '@/types/Decision';

interface ReflectionIntervalSchedulingProps {
  data: ReflectionIntervalType | undefined;
  defaultDays: number;
  createdAt: Date;
  editMode: boolean;
  onUpdate: (updates: Partial<ReflectionIntervalType>) => void;
  statusColor: string;
  statusText: string;
}

export const ReflectionIntervalScheduling = ({ 
  data, 
  defaultDays, 
  createdAt, 
  editMode, 
  onUpdate,
  statusColor,
  statusText
}: ReflectionIntervalSchedulingProps) => {
  const calculateDefaultDate = (days: number) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + days);
    return date;
  };

  return (
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
          <p className={`text-xs font-mono ${statusColor}`}>
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
};

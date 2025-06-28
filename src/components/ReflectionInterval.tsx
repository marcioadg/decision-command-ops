
import { ReflectionInterval as ReflectionIntervalType } from '@/types/Decision';
import { ReflectionIntervalStatus } from './ReflectionIntervalStatus';
import { ReflectionIntervalScheduling } from './ReflectionIntervalScheduling';
import { ReflectionIntervalNotes } from './ReflectionIntervalNotes';

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
  const { status, StatusIcon, formattedDate } = ReflectionIntervalStatus({ data });

  return (
    <div className="border border-tactical-border/30 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <h4 className="font-mono text-sm font-semibold text-tactical-text">{label}</h4>
          <span className="text-xs text-tactical-text/60">({description})</span>
        </div>
        <span className={`text-xs font-mono ${status.color}`}>
          {formattedDate}
        </span>
      </div>

      {/* Date Setting */}
      <ReflectionIntervalScheduling
        data={data}
        defaultDays={defaultDays}
        createdAt={createdAt}
        editMode={editMode}
        onUpdate={onUpdate}
        statusColor={status.color}
        statusText={status.status.toUpperCase().replace('-', ' ')}
      />

      {/* Reflection Notes */}
      <ReflectionIntervalNotes
        data={data}
        defaultDays={defaultDays}
        editMode={editMode}
        onUpdate={onUpdate}
      />
    </div>
  );
};


import { ReflectionInterval as ReflectionIntervalType } from '@/types/Decision';

interface ReflectionIntervalNotesProps {
  data: ReflectionIntervalType | undefined;
  defaultDays: number;
  editMode: boolean;
  onUpdate: (updates: Partial<ReflectionIntervalType>) => void;
}

export const ReflectionIntervalNotes = ({ 
  data, 
  defaultDays, 
  editMode, 
  onUpdate 
}: ReflectionIntervalNotesProps) => {
  return (
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
  );
};

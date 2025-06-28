
import { useState } from 'react';
import { Decision, ReflectionInterval } from '@/types/Decision';
import { Calendar, MessageSquare, ChevronDown, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DecisionReflectionSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionReflectionSection = ({ decision, editMode, onUpdate }: DecisionReflectionSectionProps) => {
  const [showReflection, setShowReflection] = useState(false);

  const hasAnyReflection = decision.reflection?.sevenDay || decision.reflection?.thirtyDay || decision.reflection?.ninetyDay || decision.reflection?.questions?.length;
  const shouldShowReflectionPrompt = decision.stage === 'decided' && !hasAnyReflection;
  const canShowReflection = decision.stage === 'decided' || decision.stage === 'lessons';

  if (!canShowReflection) {
    return null;
  }

  const handleReflectionUpdate = (updates: Partial<Decision['reflection']>) => {
    onUpdate({
      reflection: {
        sevenDay: decision.reflection?.sevenDay,
        thirtyDay: decision.reflection?.thirtyDay,
        ninetyDay: decision.reflection?.ninetyDay,
        questions: decision.reflection?.questions || [],
        ...updates
      }
    });
  };

  const handleIntervalUpdate = (interval: '7-day' | '30-day' | '90-day', updates: Partial<ReflectionInterval>) => {
    const intervalKey = interval === '7-day' ? 'sevenDay' : interval === '30-day' ? 'thirtyDay' : 'ninetyDay';
    const currentInterval = decision.reflection?.[intervalKey];
    
    handleReflectionUpdate({
      [intervalKey]: {
        date: currentInterval?.date || new Date(),
        completed: currentInterval?.completed || false,
        answers: currentInterval?.answers || [],
        ...updates
      }
    });
  };

  const getIntervalStatus = (interval: ReflectionInterval | undefined) => {
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

  const formatDueDate = (interval: ReflectionInterval | undefined) => {
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
    const date = new Date(decision.createdAt);
    date.setDate(date.getDate() + days);
    return date;
  };

  const reflectionIntervals = [
    {
      key: '7-day' as const,
      label: '7-Day Reflection',
      description: 'Initial quick review',
      data: decision.reflection?.sevenDay,
      defaultDays: 7
    },
    {
      key: '30-day' as const,
      label: '30-Day Reflection',
      description: 'Medium-term impact assessment',
      data: decision.reflection?.thirtyDay,
      defaultDays: 30
    },
    {
      key: '90-day' as const,
      label: '90-Day Reflection',
      description: 'Long-term outcome evaluation',
      data: decision.reflection?.ninetyDay,
      defaultDays: 90
    }
  ];

  return (
    <div className="border-t border-tactical-border pt-6">
      {/* Reflection Prompt for Decided Stage */}
      {shouldShowReflectionPrompt && (
        <div className="bg-tactical-accent/10 border border-tactical-accent/30 rounded p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-tactical-accent" />
            <span className="text-sm font-mono text-tactical-accent">REFLECTION RECOMMENDED</span>
          </div>
          <p className="text-xs text-tactical-text/80">
            This decision has been executed. Set up reflection intervals to review its outcomes at 7, 30, and 90 days.
          </p>
        </div>
      )}

      <button
        onClick={() => setShowReflection(!showReflection)}
        className="flex items-center space-x-2 text-tactical-accent hover:text-tactical-accent/80 transition-colors mb-4"
      >
        {showReflection ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <MessageSquare className="w-4 h-4" />
        <span className="font-mono text-sm uppercase">Multi-Interval Reflections</span>
        {hasAnyReflection && !showReflection && (
          <span className="text-xs text-tactical-text/60">
            ({reflectionIntervals.filter(r => r.data?.completed).length}/{reflectionIntervals.filter(r => r.data).length} complete)
          </span>
        )}
      </button>

      {showReflection && (
        <div className="space-y-6 pl-6">
          {/* Reflection Questions */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Standard Questions</label>
            {editMode ? (
              <textarea
                value={decision.reflection?.questions?.join('\n') || ''}
                onChange={(e) => handleReflectionUpdate({ 
                  questions: e.target.value.split('\n').filter(q => q.trim()) 
                })}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-24 resize-none"
                placeholder="What went well with this decision?&#10;What could have been improved?&#10;What would I do differently next time?"
              />
            ) : (
              <div className="text-tactical-text/80">
                {decision.reflection?.questions?.length ? (
                  <ul className="list-disc list-inside space-y-1">
                    {decision.reflection.questions.map((question, index) => (
                      <li key={index} className="text-sm">{question}</li>
                    ))}
                  </ul>
                ) : (
                  'No standard questions set'
                )}
              </div>
            )}
          </div>

          {/* Reflection Intervals */}
          {reflectionIntervals.map(({ key, label, description, data, defaultDays }) => {
            const status = getIntervalStatus(data);
            const StatusIcon = status.icon;
            
            return (
              <div key={key} className="border border-tactical-border/30 rounded p-4">
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
                        onChange={(e) => handleIntervalUpdate(key, { date: new Date(e.target.value) })}
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
                          onChange={(e) => handleIntervalUpdate(key, { completed: e.target.checked })}
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
                      onChange={(e) => handleIntervalUpdate(key, { 
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
          })}
        </div>
      )}
    </div>
  );
};

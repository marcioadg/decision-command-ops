
import { useState } from 'react';
import { Decision } from '@/types/Decision';
import { Calendar, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';

interface DecisionReflectionSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionReflectionSection = ({ decision, editMode, onUpdate }: DecisionReflectionSectionProps) => {
  const [showReflection, setShowReflection] = useState(false);

  const hasReflection = decision.reflection?.reminderDate || decision.reflection?.questions?.length;
  const isReflectionComplete = decision.reflection?.answers?.length;
  const shouldShowReflectionPrompt = decision.stage === 'decided' && !hasReflection;
  const canShowReflection = decision.stage === 'decided' || decision.stage === 'lessons';

  if (!canShowReflection) {
    return null;
  }

  const handleReflectionUpdate = (updates: Partial<Decision['reflection']>) => {
    onUpdate({
      reflection: {
        reminderDate: decision.reflection?.reminderDate || new Date(),
        questions: decision.reflection?.questions || [],
        answers: decision.reflection?.answers || [],
        ...updates
      }
    });
  };

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
            This decision has been executed. Consider setting a reflection date to review its outcomes.
          </p>
        </div>
      )}

      <button
        onClick={() => setShowReflection(!showReflection)}
        className="flex items-center space-x-2 text-tactical-accent hover:text-tactical-accent/80 transition-colors mb-4"
      >
        {showReflection ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <MessageSquare className="w-4 h-4" />
        <span className="font-mono text-sm uppercase">Reflection</span>
        {hasReflection && !showReflection && (
          <span className="text-xs text-tactical-text/60">({isReflectionComplete ? 'Complete' : 'Scheduled'})</span>
        )}
      </button>

      {showReflection && (
        <div className="space-y-4 pl-6">
          {/* Reflection Date */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Reflection Date</label>
            {editMode ? (
              <input
                type="date"
                value={decision.reflection?.reminderDate ? decision.reflection.reminderDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleReflectionUpdate({ reminderDate: new Date(e.target.value) })}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
              />
            ) : (
              <p className="text-tactical-text/80">
                {decision.reflection?.reminderDate 
                  ? decision.reflection.reminderDate.toLocaleDateString()
                  : 'Not set'
                }
              </p>
            )}
          </div>

          {/* Key Questions */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Key Questions to Ask</label>
            {editMode ? (
              <textarea
                value={decision.reflection?.questions?.join('\n') || ''}
                onChange={(e) => handleReflectionUpdate({ 
                  questions: e.target.value.split('\n').filter(q => q.trim()) 
                })}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-24 resize-none"
                placeholder="What went well?&#10;What could be improved?&#10;What would I do differently?"
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
                  'No questions set'
                )}
              </div>
            )}
          </div>

          {/* Reflection Notes/Answers */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Reflection Notes</label>
            {editMode ? (
              <textarea
                value={decision.reflection?.answers?.join('\n\n') || ''}
                onChange={(e) => handleReflectionUpdate({ 
                  answers: e.target.value.split('\n\n').filter(a => a.trim()) 
                })}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-32 resize-none"
                placeholder="Your insights and learnings from this decision..."
              />
            ) : (
              <div className="text-tactical-text/80 whitespace-pre-wrap">
                {decision.reflection?.answers?.length 
                  ? decision.reflection.answers.join('\n\n')
                  : 'No reflection notes yet'
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

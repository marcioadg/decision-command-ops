
import { useState } from 'react';
import { Decision, ReflectionInterval } from '@/types/Decision';
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { ReflectionPrompt } from './ReflectionPrompt';
import { ReflectionQuestions } from './ReflectionQuestions';
import { ReflectionInterval as ReflectionIntervalComponent } from './ReflectionInterval';

interface DecisionReflectionSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionReflectionSection = ({ decision, editMode, onUpdate }: DecisionReflectionSectionProps) => {
  const [showReflection, setShowReflection] = useState(false);

  const hasReflectionContent = () => {
    const reflection = decision.reflection;
    if (!reflection) return false;
    
    // Check if there's meaningful content in the 30-day reflection
    const hasThirtyDayContent = reflection.thirtyDay?.answers?.some(answer => answer.trim().length > 0);
    const hasQuestions = reflection.questions?.some(question => question.trim().length > 0);
    
    return hasThirtyDayContent || hasQuestions;
  };

  const hasAnyReflection = decision.reflection?.thirtyDay || decision.reflection?.questions?.length;
  const shouldShowReflectionPrompt = decision.stage === 'executed' && !hasAnyReflection;
  // Only show reflections for executed stage, or if there's saved content (for backwards compatibility)
  const canShowReflection = decision.stage === 'executed' || hasReflectionContent();

  if (!canShowReflection) {
    return null;
  }

  const handleReflectionUpdate = (updates: Partial<Decision['reflection']>) => {
    console.log('DecisionReflectionSection: Reflection update');
    
    onUpdate({
      reflection: {
        thirtyDay: decision.reflection?.thirtyDay,
        questions: decision.reflection?.questions || [],
        ...updates
      }
    });
  };

  const handleIntervalUpdate = (updates: Partial<ReflectionInterval>) => {
    const currentInterval = decision.reflection?.thirtyDay;
    
    handleReflectionUpdate({
      thirtyDay: {
        date: currentInterval?.date || new Date(),
        completed: currentInterval?.completed || false,
        answers: currentInterval?.answers || [],
        wasCorrect: currentInterval?.wasCorrect,
        ...updates
      }
    });
  };

  const handleQuestionsUpdate = (questions: string[]) => {
    handleReflectionUpdate({ questions });
  };

  return (
    <div className="border-t border-tactical-border pt-6">
      {/* Reflection Prompt for Executed Stage */}
      <ReflectionPrompt shouldShow={shouldShowReflectionPrompt} />

      <button
        onClick={() => setShowReflection(!showReflection)}
        className="flex items-center space-x-2 text-tactical-accent hover:text-tactical-accent/80 transition-colors mb-4"
      >
        {showReflection ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <MessageSquare className="w-4 h-4" />
        <span className="font-mono text-sm uppercase">30-Day Reflection</span>
        {hasAnyReflection && !showReflection && (
          <span className="text-xs text-tactical-text/60">
            ({decision.reflection?.thirtyDay?.completed ? 'Complete' : 'Pending'})
          </span>
        )}
      </button>

      {showReflection && (
        <div className="space-y-6 pl-6">
          {/* Reflection Questions */}
          <ReflectionQuestions
            questions={decision.reflection?.questions}
            editMode={editMode}
            onUpdate={handleQuestionsUpdate}
          />

          {/* 30-Day Reflection Interval */}
          <ReflectionIntervalComponent
            intervalKey="30-day"
            label="30-Day Reflection"
            description="Medium-term impact assessment"
            data={decision.reflection?.thirtyDay}
            defaultDays={30}
            createdAt={decision.createdAt}
            editMode={editMode}
            onUpdate={handleIntervalUpdate}
          />
        </div>
      )}
    </div>
  );
};

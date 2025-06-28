
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
  disabled?: boolean;
}

export const DecisionReflectionSection = ({ decision, editMode, onUpdate, disabled = false }: DecisionReflectionSectionProps) => {
  const [showReflection, setShowReflection] = useState(false);

  const hasReflectionContent = () => {
    const reflection = decision.reflection;
    if (!reflection) return false;
    
    // Check if there's meaningful content in any reflection interval
    const hasSevenDayContent = reflection.sevenDay?.answers?.some(answer => answer.trim().length > 0);
    const hasThirtyDayContent = reflection.thirtyDay?.answers?.some(answer => answer.trim().length > 0);
    const hasNinetyDayContent = reflection.ninetyDay?.answers?.some(answer => answer.trim().length > 0);
    const hasQuestions = reflection.questions?.some(question => question.trim().length > 0);
    
    return hasSevenDayContent || hasThirtyDayContent || hasNinetyDayContent || hasQuestions;
  };

  const hasAnyReflection = decision.reflection?.sevenDay || decision.reflection?.thirtyDay || decision.reflection?.ninetyDay || decision.reflection?.questions?.length;
  const shouldShowReflectionPrompt = decision.stage === 'decided' && !hasAnyReflection;
  // Only show reflections for decided stage, or if there's saved content (for backwards compatibility)
  const canShowReflection = decision.stage === 'decided' || hasReflectionContent();

  if (!canShowReflection) {
    return null;
  }

  const handleReflectionUpdate = (updates: Partial<Decision['reflection']>) => {
    console.log('DecisionReflectionSection: Reflection update, disabled:', disabled);
    
    if (disabled) {
      console.log('DecisionReflectionSection: Update blocked due to disabled state');
      return;
    }
    
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
    if (disabled) {
      console.log('DecisionReflectionSection: Interval update blocked due to disabled state');
      return;
    }
    
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

  const handleQuestionsUpdate = (questions: string[]) => {
    if (disabled) {
      console.log('DecisionReflectionSection: Questions update blocked due to disabled state');
      return;
    }
    
    handleReflectionUpdate({ questions });
  };

  const reflectionIntervals = [
    {
      key: '7-day' as const,
      label: 'Reflection in 7D',
      description: 'Initial quick review',
      data: decision.reflection?.sevenDay,
      defaultDays: 7
    },
    {
      key: '30-day' as const,
      label: 'Reflection in 30D',
      description: 'Medium-term impact assessment',
      data: decision.reflection?.thirtyDay,
      defaultDays: 30
    },
    {
      key: '90-day' as const,
      label: 'Reflection in 90D',
      description: 'Long-term outcome evaluation',
      data: decision.reflection?.ninetyDay,
      defaultDays: 90
    }
  ];

  return (
    <div className="border-t border-tactical-border pt-6">
      {/* Reflection Prompt for Decided Stage */}
      <ReflectionPrompt shouldShow={shouldShowReflectionPrompt} />

      <button
        onClick={() => setShowReflection(!showReflection)}
        disabled={disabled}
        className="flex items-center space-x-2 text-tactical-accent hover:text-tactical-accent/80 transition-colors mb-4 disabled:opacity-50"
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
          <ReflectionQuestions
            questions={decision.reflection?.questions}
            editMode={editMode && !disabled}
            onUpdate={handleQuestionsUpdate}
          />

          {/* Reflection Intervals */}
          {reflectionIntervals.map(({ key, label, description, data, defaultDays }) => (
            <ReflectionIntervalComponent
              key={key}
              intervalKey={key}
              label={label}
              description={description}
              data={data}
              defaultDays={defaultDays}
              createdAt={decision.createdAt}
              editMode={editMode && !disabled}
              onUpdate={(updates) => handleIntervalUpdate(key, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

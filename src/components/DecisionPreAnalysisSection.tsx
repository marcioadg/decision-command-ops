
import { Decision, PreAnalysis } from '@/types/Decision';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useDebounced } from '@/hooks/useDebounced';

interface DecisionPreAnalysisSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updates: Partial<Decision>) => void;
}

export const DecisionPreAnalysisSection = ({ decision, editMode, onUpdate }: DecisionPreAnalysisSectionProps) => {
  // Only show for active stages (not decided)
  const shouldShow = decision.stage !== 'decided';
  
  if (!shouldShow) {
    return null;
  }

  // Local state for input values to prevent conflicts
  const [localValues, setLocalValues] = useState({
    upside: decision.preAnalysis?.upside || '',
    downside: decision.preAnalysis?.downside || '',
    alignment: decision.preAnalysis?.alignment || ''
  });

  // Debounced values to prevent excessive saves
  const debouncedUpside = useDebounced(localValues.upside, 500);
  const debouncedDownside = useDebounced(localValues.downside, 500);
  const debouncedAlignment = useDebounced(localValues.alignment, 500);

  // Update local state when decision changes (from external sources)
  useEffect(() => {
    console.log('DecisionPreAnalysisSection: Decision preAnalysis changed, updating local state');
    setLocalValues({
      upside: decision.preAnalysis?.upside || '',
      downside: decision.preAnalysis?.downside || '',
      alignment: decision.preAnalysis?.alignment || ''
    });
  }, [decision.preAnalysis]);

  // Save debounced changes to the backend
  useEffect(() => {
    const currentPreAnalysis = decision.preAnalysis || {};
    const hasChanges = 
      debouncedUpside !== (currentPreAnalysis.upside || '') ||
      debouncedDownside !== (currentPreAnalysis.downside || '') ||
      debouncedAlignment !== (currentPreAnalysis.alignment || '');

    if (hasChanges && editMode) {
      console.log('DecisionPreAnalysisSection: Saving debounced changes:', {
        upside: debouncedUpside,
        downside: debouncedDownside,
        alignment: debouncedAlignment
      });
      
      const updatedPreAnalysis = {
        ...currentPreAnalysis,
        upside: debouncedUpside,
        downside: debouncedDownside,
        alignment: debouncedAlignment
      };
      
      onUpdate({ preAnalysis: updatedPreAnalysis });
    }
  }, [debouncedUpside, debouncedDownside, debouncedAlignment, decision.preAnalysis, editMode, onUpdate]);

  const handleInputChange = (field: keyof PreAnalysis, value: string) => {
    console.log('DecisionPreAnalysisSection: Input change for field:', field, 'value length:', value.length);
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const questions = [
    {
      key: 'upside' as keyof PreAnalysis,
      label: "What's the upside of this decision?",
      placeholder: "Consider the potential benefits, opportunities, and positive outcomes...",
      value: localValues.upside
    },
    {
      key: 'downside' as keyof PreAnalysis,
      label: "What's the downside of this decision?",
      placeholder: "Think about risks, costs, and potential negative consequences...",
      value: localValues.downside
    },
    {
      key: 'alignment' as keyof PreAnalysis,
      label: "Does it align with my long-term goals?",
      placeholder: "Evaluate how this decision supports or conflicts with your strategic objectives...",
      value: localValues.alignment
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-tactical-accent uppercase tracking-wider">
          PRE-DECISION ANALYSIS
        </h3>
        <div className="hud-metric text-xs">
          STAGE: {decision.stage.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.key} className="space-y-2">
            <label className="block text-sm font-mono text-tactical-text">
              {index + 1}. {question.label}
            </label>
            {editMode ? (
              <Textarea
                value={question.value}
                onChange={(e) => {
                  console.log('DecisionPreAnalysisSection: Textarea onChange triggered for:', question.key);
                  handleInputChange(question.key, e.target.value);
                }}
                placeholder={question.placeholder}
                className="min-h-[80px] bg-tactical-surface border-tactical-border text-tactical-text font-mono text-sm resize-none focus:border-tactical-accent"
                rows={3}
              />
            ) : (
              <div className="min-h-[80px] p-3 bg-tactical-surface border border-tactical-border rounded text-tactical-text font-mono text-sm">
                {question.value || (
                  <span className="text-tactical-text/50 italic">
                    No analysis provided yet...
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!editMode && (!decision.preAnalysis?.upside && !decision.preAnalysis?.downside && !decision.preAnalysis?.alignment) && (
        <div className="p-3 border border-tactical-border/50 rounded bg-tactical-surface/30">
          <p className="text-xs font-mono text-tactical-text/70 text-center">
            Complete the pre-decision analysis to help guide your decision-making process
          </p>
        </div>
      )}
    </div>
  );
};

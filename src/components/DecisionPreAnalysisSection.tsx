
import { Decision, PreAnalysis } from '@/types/Decision';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface DecisionPreAnalysisSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updates: Partial<Decision>) => void;
  disabled?: boolean;
}

export const DecisionPreAnalysisSection = ({ decision, editMode, onUpdate, disabled = false }: DecisionPreAnalysisSectionProps) => {
  // Only show for active stages (not decided)
  const shouldShow = decision.stage !== 'decided';
  
  if (!shouldShow) {
    return null;
  }

  // FIXED: Use decision values directly instead of local state to prevent loops
  const currentPreAnalysis = decision.preAnalysis || {};
  
  const handleInputChange = (field: keyof PreAnalysis, value: string) => {
    console.log('DecisionPreAnalysisSection: Input change for field:', field, 'value length:', value.length, 'disabled:', disabled);
    
    if (disabled) {
      console.log('DecisionPreAnalysisSection: Input blocked due to disabled state');
      return;
    }
    
    // Update immediately without debouncing - let the parent handle batching
    const updatedPreAnalysis = {
      ...currentPreAnalysis,
      [field]: value
    };
    
    onUpdate({ preAnalysis: updatedPreAnalysis });
  };

  const questions = [
    {
      key: 'upside' as keyof PreAnalysis,
      label: "What's the upside of this decision?",
      placeholder: "Consider the potential benefits, opportunities, and positive outcomes...",
      value: currentPreAnalysis.upside || ''
    },
    {
      key: 'downside' as keyof PreAnalysis,
      label: "What's the downside of this decision?",
      placeholder: "Think about risks, costs, and potential negative consequences...",
      value: currentPreAnalysis.downside || ''
    },
    {
      key: 'alignment' as keyof PreAnalysis,
      label: "Does it align with my long-term goals?",
      placeholder: "Evaluate how this decision supports or conflicts with your strategic objectives...",
      value: currentPreAnalysis.alignment || ''
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
                onChange={(e) => handleInputChange(question.key, e.target.value)}
                placeholder={question.placeholder}
                disabled={disabled}
                className="min-h-[80px] bg-tactical-surface border-tactical-border text-tactical-text font-mono text-sm resize-none focus:border-tactical-accent disabled:opacity-50"
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

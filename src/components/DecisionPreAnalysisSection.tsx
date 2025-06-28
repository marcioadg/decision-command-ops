
import { Decision, PreAnalysis } from '@/types/Decision';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DecisionPreAnalysisSectionProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updates: Partial<Decision>) => void;
}

export const DecisionPreAnalysisSection = ({ decision, editMode, onUpdate }: DecisionPreAnalysisSectionProps) => {
  const [recentlyUpdated, setRecentlyUpdated] = useState<Record<string, boolean>>({});
  
  // Only show for active stages (not decided)
  const shouldShow = decision.stage !== 'decided';
  
  if (!shouldShow) {
    return null;
  }

  const handlePreAnalysisUpdate = (field: keyof PreAnalysis, value: string) => {
    console.log('DecisionPreAnalysisSection: Updating field:', field, 'with value:', value);
    const updatedPreAnalysis = {
      ...decision.preAnalysis,
      [field]: value
    };
    console.log('DecisionPreAnalysisSection: Updated preAnalysis object:', updatedPreAnalysis);
    const updates = { preAnalysis: updatedPreAnalysis };
    console.log('DecisionPreAnalysisSection: Calling onUpdate with:', updates);
    onUpdate(updates);

    // Show field-specific save indicator
    setRecentlyUpdated(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setRecentlyUpdated(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  const questions = [
    {
      key: 'upside' as keyof PreAnalysis,
      label: "What's the upside of this decision?",
      placeholder: "Consider the potential benefits, opportunities, and positive outcomes..."
    },
    {
      key: 'downside' as keyof PreAnalysis,
      label: "What's the downside of this decision?",
      placeholder: "Think about risks, costs, and potential negative consequences..."
    },
    {
      key: 'alignment' as keyof PreAnalysis,
      label: "Does it align with my long-term goals?",
      placeholder: "Evaluate how this decision supports or conflicts with your strategic objectives..."
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-mono text-tactical-text">
                {index + 1}. {question.label}
              </label>
              {recentlyUpdated[question.key] && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs font-mono">Saved</span>
                </div>
              )}
            </div>
            {editMode ? (
              <Textarea
                value={decision.preAnalysis?.[question.key] || ''}
                onChange={(e) => {
                  console.log('DecisionPreAnalysisSection: Textarea onChange triggered for:', question.key);
                  handlePreAnalysisUpdate(question.key, e.target.value);
                }}
                placeholder={question.placeholder}
                className="min-h-[80px] bg-tactical-surface border-tactical-border text-tactical-text font-mono text-sm resize-none focus:border-tactical-accent"
                rows={3}
              />
            ) : (
              <div className="min-h-[80px] p-3 bg-tactical-surface border border-tactical-border rounded text-tactical-text font-mono text-sm">
                {decision.preAnalysis?.[question.key] || (
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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding } from '../OnboardingProvider';
import { DecisionCategory, DecisionStage } from '@/types/Decision';

const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
const stages: DecisionStage[] = ['backlog', 'considering', 'committed', 'decided'];

interface DecisionForm {
  title: string;
  category: DecisionCategory | '';
  stage: DecisionStage;
}

export const DecisionCapture = () => {
  const { nextStep, prevStep, personalityProfile, setDecisions } = useOnboarding();
  const [decisionForms, setDecisionForms] = useState<DecisionForm[]>([
    { title: '', category: '', stage: 'backlog' },
    { title: '', category: '', stage: 'backlog' },
    { title: '', category: '', stage: 'backlog' }
  ]);

  const updateDecision = (index: number, field: keyof DecisionForm, value: string) => {
    setDecisionForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const handleNext = () => {
    const validDecisions = decisionForms.filter(form => 
      form.title.trim() && form.category
    ).map(form => ({
      title: form.title,
      category: form.category as DecisionCategory,
      stage: form.stage
    }));

    if (validDecisions.length > 0) {
      setDecisions(validDecisions);
      nextStep();
    }
  };

  const validDecisionsCount = decisionForms.filter(form => 
    form.title.trim() && form.category
  ).length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-tactical-accent font-tactical mb-4">
          Load Your Decision Backlog
        </h2>
        <p className="text-tactical-text/80 mb-2">
          Let's capture your current decision backlog. Think: "What am I stuck on?"
        </p>
        {personalityProfile && (
          <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-4 mt-4">
            <p className="text-tactical-accent font-semibold">
              You're a {personalityProfile.profileType}
            </p>
            <p className="text-tactical-text/70 text-sm mt-1">
              You value clarity and speed. Let's set up your cockpit.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {decisionForms.map((form, index) => (
          <div key={index} className="bg-tactical-surface border border-tactical-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-tactical-text mb-4">
              Decision #{index + 1}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tactical-text mb-2">
                  What decision are you facing?
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => updateDecision(index, 'title', e.target.value)}
                  placeholder="e.g., Should we hire a new marketing manager?"
                  className="bg-tactical-bg border-tactical-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tactical-text mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateDecision(index, 'category', e.target.value)}
                    className="w-full p-2 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tactical-text mb-2">
                    Current Stage
                  </label>
                  <select
                    value={form.stage}
                    onChange={(e) => updateDecision(index, 'stage', e.target.value)}
                    className="w-full p-2 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-tactical-text/60">
        <p>Fill out at least 1 decision to continue • {validDecisionsCount}/3 completed</p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={validDecisionsCount === 0}
          className="bg-tactical-accent hover:bg-tactical-accent/90"
        >
          Set Confidence Levels
        </Button>
      </div>
    </div>
  );
};

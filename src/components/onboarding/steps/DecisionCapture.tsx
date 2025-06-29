import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding } from '../OnboardingProvider';
import { DecisionCategory } from '@/types/Decision';

const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];

const confidenceLevels = [
  { value: 0, label: '0%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
  { value: 100, label: '100%' }
];

interface DecisionForm {
  title: string;
  category: DecisionCategory | '';
  confidence: number;
}

const getPersonalityMessage = (profileType: string): string => {
  switch (profileType) {
    case 'Strategic Operator':
      return 'You value clarity and speed. Let\'s set up your cockpit.';
    case 'Analytical Leader':
      return 'You build consensus through analysis. Let\'s organize your decisions.';
    case 'Intuitive Commander':
      return 'You trust instincts and move fast. Let\'s capture your priorities.';
    case 'Thoughtful Facilitator':
      return 'You blend wisdom with team input. Let\'s structure your thoughts.';
    default:
      return 'Let\'s organize your decision-making process.';
  }
};

export const DecisionCapture = () => {
  const { nextStep, prevStep, personalityProfile, setDecisions } = useOnboarding();
  const [decisionForms, setDecisionForms] = useState<DecisionForm[]>([
    { title: '', category: '', confidence: 50 },
    { title: '', category: '', confidence: 50 },
    { title: '', category: '', confidence: 50 }
  ]);

  const updateDecision = (index: number, field: keyof DecisionForm, value: string | number) => {
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
      stage: 'backlog' as const,
      confidence: form.confidence
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
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-tactical-accent font-tactical mb-3 md:mb-4">
          Load Your Decision Backlog
        </h2>
        <div className="space-y-3">
          <p className="text-tactical-text/80 text-sm md:text-base">
            Let's capture your current decision backlog. Think: "What am I stuck on?"
          </p>
          {personalityProfile && (
            <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-3 md:p-4">
              <p className="text-tactical-accent font-semibold text-sm md:text-base">
                You're a {personalityProfile.profileType}
              </p>
              <p className="text-tactical-text/70 text-xs md:text-sm mt-1">
                {getPersonalityMessage(personalityProfile.profileType)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-4 md:p-6">
        {/* Always use mobile-first stacked layout */}
        <div className="space-y-6">
          {decisionForms.map((form, index) => (
            <div key={index} className="border-b border-tactical-border/30 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-tactical-accent font-mono text-sm uppercase tracking-wider mb-4">
                Decision #{index + 1}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
                    Decision Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateDecision(index, 'title', e.target.value)}
                    placeholder="e.g., Should we hire a new marketing manager?"
                    className="bg-tactical-bg border-tactical-border min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => updateDecision(index, 'category', e.target.value)}
                      className="w-full p-3 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text min-h-[44px]"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
                      Confidence
                    </label>
                    <select
                      value={form.confidence}
                      onChange={(e) => updateDecision(index, 'confidence', parseInt(e.target.value))}
                      className="w-full p-3 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text min-h-[44px]"
                    >
                      {confidenceLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-tactical-text/60 text-sm">
        <p>Fill out at least 1 decision to continue • {validDecisionsCount}/3 completed</p>
      </div>

      <div className="flex justify-between pt-4 md:pt-6">
        <Button variant="outline" onClick={prevStep} className="min-h-[44px]">
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={validDecisionsCount === 0}
          className="bg-tactical-accent hover:bg-tactical-accent/90 min-h-[44px]"
        >
          Schedule Reflections
        </Button>
      </div>
    </div>
  );
};

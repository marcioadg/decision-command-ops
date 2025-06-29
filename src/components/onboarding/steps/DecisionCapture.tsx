
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

      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-tactical-border">
            <div className="col-span-1 text-tactical-accent font-mono text-xs uppercase tracking-wider">#</div>
            <div className="col-span-5 text-tactical-accent font-mono text-xs uppercase tracking-wider">Decision Title</div>
            <div className="col-span-3 text-tactical-accent font-mono text-xs uppercase tracking-wider">Category</div>
            <div className="col-span-3 text-tactical-accent font-mono text-xs uppercase tracking-wider">Confidence</div>
          </div>
          
          <div className="space-y-4">
            {decisionForms.map((form, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1 text-tactical-text font-mono text-sm">
                  {index + 1}
                </div>
                <div className="col-span-5">
                  <Input
                    value={form.title}
                    onChange={(e) => updateDecision(index, 'title', e.target.value)}
                    placeholder="e.g., Should we hire a new marketing manager?"
                    className="bg-tactical-bg border-tactical-border text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={form.category}
                    onChange={(e) => updateDecision(index, 'category', e.target.value)}
                    className="w-full p-2 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <select
                    value={form.confidence}
                    onChange={(e) => updateDecision(index, 'confidence', parseInt(e.target.value))}
                    className="w-full p-2 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text text-sm"
                  >
                    {confidenceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="md:hidden space-y-6">
          {decisionForms.map((form, index) => (
            <div key={index} className="border-b border-tactical-border/30 pb-6 last:border-b-0">
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
                    className="bg-tactical-bg border-tactical-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
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
                    <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
                      Confidence
                    </label>
                    <select
                      value={form.confidence}
                      onChange={(e) => updateDecision(index, 'confidence', parseInt(e.target.value))}
                      className="w-full p-2 bg-tactical-bg border border-tactical-border rounded-md text-tactical-text"
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

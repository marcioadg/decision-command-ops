
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
  skipped: boolean;
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
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [decisionForms, setDecisionForms] = useState<DecisionForm[]>([
    { title: '', category: '', confidence: 50, skipped: false },
    { title: '', category: '', confidence: 50, skipped: false },
    { title: '', category: '', confidence: 50, skipped: false }
  ]);

  const currentDecision = decisionForms[currentDecisionIndex];
  const isFirstDecision = currentDecisionIndex === 0;
  const isLastDecision = currentDecisionIndex === 2;
  const canSkipCurrent = currentDecisionIndex > 0; // Can skip decision 2 and 3
  
  const updateCurrentDecision = (field: keyof DecisionForm, value: string | number | boolean) => {
    setDecisionForms(prev => prev.map((form, i) => 
      i === currentDecisionIndex ? { ...form, [field]: value } : form
    ));
  };

  const handleNextDecision = () => {
    if (!isLastDecision) {
      setCurrentDecisionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevDecision = () => {
    if (currentDecisionIndex > 0) {
      setCurrentDecisionIndex(prev => prev - 1);
    }
  };

  const handleSkipDecision = () => {
    if (canSkipCurrent) {
      updateCurrentDecision('skipped', true);
      updateCurrentDecision('title', '');
      updateCurrentDecision('category', '');
      handleNextDecision();
    }
  };

  const handleFinish = () => {
    const validDecisions = decisionForms.filter(form => 
      !form.skipped && form.title.trim() && form.category
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

  const isCurrentDecisionValid = currentDecision.title.trim() && currentDecision.category && !currentDecision.skipped;
  const completedDecisions = decisionForms.filter(form => !form.skipped && form.title.trim() && form.category).length;
  const skippedDecisions = decisionForms.filter(form => form.skipped).length;
  const hasAtLeastOneDecision = completedDecisions > 0;

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

      {/* Progress Indicator */}
      <div className="text-center">
        <div className="bg-tactical-surface border border-tactical-border rounded-lg p-3 md:p-4">
          <p className="text-tactical-accent font-mono text-sm uppercase tracking-wider mb-2">
            Decision {currentDecisionIndex + 1} of 3
          </p>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentDecisionIndex
                    ? 'bg-tactical-accent'
                    : index < currentDecisionIndex
                    ? decisionForms[index].skipped
                      ? 'bg-tactical-text/30'
                      : 'bg-tactical-accent/60'
                    : 'bg-tactical-border'
                }`}
              />
            ))}
          </div>
          <p className="text-tactical-text/60 text-xs mt-2">
            {completedDecisions} completed • {skippedDecisions} skipped
          </p>
        </div>
      </div>

      {/* Current Decision Form */}
      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-4 md:p-6">
        <h3 className="text-tactical-accent font-mono text-sm uppercase tracking-wider mb-4">
          Decision #{currentDecisionIndex + 1}
          {isFirstDecision && <span className="text-tactical-text/60 ml-2">(Required)</span>}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-tactical-text font-mono text-xs uppercase tracking-wider mb-2">
              Decision Title
            </label>
            <Input
              value={currentDecision.title}
              onChange={(e) => updateCurrentDecision('title', e.target.value)}
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
                value={currentDecision.category}
                onChange={(e) => updateCurrentDecision('category', e.target.value)}
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
                value={currentDecision.confidence}
                onChange={(e) => updateCurrentDecision('confidence', parseInt(e.target.value))}
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

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 md:pt-6">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={prevStep} className="min-h-[44px]">
            Back
          </Button>
          {currentDecisionIndex > 0 && (
            <Button 
              variant="outline" 
              onClick={handlePrevDecision}
              className="min-h-[44px]"
            >
              Previous Decision
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {canSkipCurrent && (
            <Button 
              variant="outline"
              onClick={handleSkipDecision}
              className="min-h-[44px] text-tactical-text/60 hover:text-tactical-text"
            >
              Skip This Decision
            </Button>
          )}
          
          {isLastDecision ? (
            <Button 
              onClick={handleFinish}
              disabled={!hasAtLeastOneDecision}
              className="bg-tactical-accent hover:bg-tactical-accent/90 min-h-[44px]"
            >
              Schedule Reflections
            </Button>
          ) : (
            <Button 
              onClick={handleNextDecision}
              disabled={!isCurrentDecisionValid && !canSkipCurrent}
              className="bg-tactical-accent hover:bg-tactical-accent/90 min-h-[44px]"
            >
              Next Decision
            </Button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-tactical-text/60 text-sm">
        {isFirstDecision ? (
          <p>Fill out the first decision to continue</p>
        ) : (
          <p>Fill out this decision or skip to move forward • Need at least 1 decision to finish</p>
        )}
      </div>
    </div>
  );
};

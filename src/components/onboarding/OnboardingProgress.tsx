
import React from 'react';
import { useOnboarding } from './OnboardingProvider';

export const OnboardingProgress = () => {
  const { currentStep, totalSteps } = useOnboarding();

  return (
    <div className="w-full bg-tactical-surface border-b border-tactical-border">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-tactical-accent font-mono text-sm uppercase tracking-wider">
            Mission Progress
          </span>
          <span className="text-tactical-text/60 font-mono text-sm">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <div className="w-full bg-tactical-bg rounded-full h-2">
          <div 
            className="bg-tactical-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { SkipOnboardingButton } from './SkipOnboardingButton';

export const OnboardingProgress = () => {
  const { currentStep, totalSteps } = useOnboarding();

  return (
    <div className="w-full bg-tactical-surface border-b border-tactical-border">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-tactical-accent font-mono text-xs md:text-sm uppercase tracking-wider">
            Mission Progress
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-tactical-text/60 font-mono text-xs md:text-sm">
              {currentStep}/{totalSteps}
            </span>
            <SkipOnboardingButton />
          </div>
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

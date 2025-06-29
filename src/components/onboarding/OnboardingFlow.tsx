
import React from 'react';
import { useOnboarding } from './OnboardingProvider';
import { MissionBrief } from './steps/MissionBrief';
import { PersonalityQuiz } from './steps/PersonalityQuiz';
import { DecisionCapture } from './steps/DecisionCapture';
import { ConfidenceLevels } from './steps/ConfidenceLevels';
import { ReflectionScheduling } from './steps/ReflectionScheduling';
import { OnboardingProgress } from './OnboardingProgress';

export const OnboardingFlow = () => {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <MissionBrief />;
      case 2:
        return <PersonalityQuiz />;
      case 3:
        return <DecisionCapture />;
      case 4:
        return <ConfidenceLevels />;
      case 5:
        return <ReflectionScheduling />;
      default:
        return <MissionBrief />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingProgress />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

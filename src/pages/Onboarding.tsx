
import React from 'react';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      <OnboardingProvider>
        <OnboardingFlow />
      </OnboardingProvider>
    </div>
  );
};

export default Onboarding;

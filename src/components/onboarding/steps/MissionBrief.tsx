
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '../OnboardingProvider';

export const MissionBrief = () => {
  const { nextStep } = useOnboarding();

  return (
    <div className="text-center space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-tactical-accent font-tactical leading-tight">
          "The job of the CEO is to make fewer, better decisions."
        </h1>
        <div className="space-y-3 text-tactical-text/80">
          <p className="text-lg md:text-xl">
            Welcome to <span className="text-tactical-accent font-semibold">Decision Command</span>—your personal command center for strategic clarity.
          </p>
          <p className="text-base md:text-lg">
            Capture key decisions. Track confidence. Reflect to improve.
          </p>
        </div>
      </div>

      <div className="pt-6 md:pt-8">
        <Button 
          onClick={nextStep}
          className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-semibold px-6 md:px-8 py-3 text-base md:text-lg min-h-[48px] w-full sm:w-auto"
          size="lg"
        >
          Begin Mission
          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      <div className="pt-6 md:pt-8 text-tactical-text/60 text-sm">
        <p>Ready to take command of your decision-making process?</p>
      </div>
    </div>
  );
};

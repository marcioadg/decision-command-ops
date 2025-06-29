
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '../OnboardingProvider';

export const MissionBrief = () => {
  const { nextStep } = useOnboarding();

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-tactical-accent font-tactical leading-tight">
          "The job of the CEO is to make fewer, better decisions."
        </h1>
        <div className="space-y-3 text-tactical-text/80">
          <p className="text-xl">
            Welcome to <span className="text-tactical-accent font-semibold">Decision Command</span>—your personal command center for strategic clarity.
          </p>
          <p className="text-lg">
            Capture key decisions. Track confidence. Reflect to improve.
          </p>
        </div>
      </div>

      <div className="pt-8">
        <Button 
          onClick={nextStep}
          className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-semibold px-8 py-3 text-lg"
          size="lg"
        >
          Begin Mission
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="pt-8 text-tactical-text/60 text-sm">
        <p>Ready to take command of your decision-making process?</p>
      </div>
    </div>
  );
};

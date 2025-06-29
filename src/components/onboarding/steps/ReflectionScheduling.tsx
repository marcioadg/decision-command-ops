
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '../OnboardingProvider';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const ReflectionScheduling = () => {
  const { prevStep, decisions, personalityProfile } = useOnboarding();
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    
    try {
      // Mark onboarding as completed
      await completeOnboarding();
      
      // Show success message
      toast({
        title: "MISSION COMPLETE",
        description: "Welcome to Decision Command. Your tactical dashboard is ready.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "SYSTEM ERROR",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-tactical-accent font-tactical mb-3 md:mb-4">
          Mission Setup Complete
        </h2>
        <p className="text-tactical-text/80 mb-4 text-sm md:text-base">
          Your tactical decision pipeline is now configured and ready for deployment.
        </p>
        
        {personalityProfile && (
          <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-4 md:p-6 mt-6">
            <h3 className="text-tactical-accent font-semibold text-base md:text-lg mb-3">
              Command Profile: {personalityProfile.profileType}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
              <div className="flex justify-between sm:block">
                <span className="text-tactical-text/60">Decision Speed:</span>
                <span className="sm:ml-0 ml-2 text-tactical-text capitalize">{personalityProfile.decisionSpeed}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-tactical-text/60">Approach:</span>
                <span className="sm:ml-0 ml-2 text-tactical-text capitalize">{personalityProfile.approach}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-tactical-text/60">Style:</span>
                <span className="sm:ml-0 ml-2 text-tactical-text capitalize">{personalityProfile.style}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-tactical-text/60">Risk Tolerance:</span>
                <span className="sm:ml-0 ml-2 text-tactical-text capitalize">{personalityProfile.riskTolerance}</span>
              </div>
            </div>
          </div>
        )}

        {decisions.length > 0 && (
          <div className="bg-tactical-surface border border-tactical-border rounded-lg p-4 md:p-6 mt-6">
            <h3 className="text-tactical-accent font-semibold text-base md:text-lg mb-3">
              Decision Backlog Loaded
            </h3>
            <p className="text-tactical-text/80 text-sm mb-3">
              {decisions.length} decision{decisions.length > 1 ? 's' : ''} ready for tactical analysis
            </p>
            <div className="space-y-2">
              {decisions.map((decision, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm space-y-1 sm:space-y-0">
                  <span className="text-tactical-text">{decision.title}</span>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <span className="text-tactical-accent font-mono text-xs">
                      {decision.category}
                    </span>
                    <span className="text-tactical-text/60 font-mono text-xs">
                      {decision.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-tactical-text/60 mb-6 text-sm md:text-base">
          Your command center is ready. Deploy to your tactical dashboard?
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between pt-4 md:pt-6 space-y-3 sm:space-y-0">
          <Button variant="outline" onClick={prevStep} disabled={isCompleting} className="min-h-[44px] w-full sm:w-auto">
            Back
          </Button>
          <Button 
            onClick={handleCompleteOnboarding}
            disabled={isCompleting}
            className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-semibold px-6 md:px-8 min-h-[44px] w-full sm:w-auto"
          >
            {isCompleting ? 'DEPLOYING...' : 'DEPLOY TO DASHBOARD'}
          </Button>
        </div>
      </div>
    </div>
  );
};

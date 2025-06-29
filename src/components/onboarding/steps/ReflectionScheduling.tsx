
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
    <div className="space-y-8 md:space-y-12 px-4 md:px-0">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-tactical-accent font-tactical mb-4 md:mb-6">
          Mission Setup Complete
        </h2>
        <p className="text-tactical-text/80 mb-6 md:mb-8 text-sm md:text-base">
          Your tactical decision pipeline is now configured and ready for deployment.
        </p>
        
        {personalityProfile && (
          <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-6 md:p-8 mt-8 md:mt-10">
            <h3 className="text-tactical-accent font-semibold text-lg md:text-xl mb-6 md:mb-8">
              Command Profile: {personalityProfile.profileType}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 text-sm md:text-base">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <span className="text-tactical-text/60 font-medium">Decision Speed:</span>
                <span className="text-tactical-text capitalize font-mono bg-tactical-bg px-3 py-1 rounded">
                  {personalityProfile.decisionSpeed}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <span className="text-tactical-text/60 font-medium">Approach:</span>
                <span className="text-tactical-text capitalize font-mono bg-tactical-bg px-3 py-1 rounded">
                  {personalityProfile.approach}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <span className="text-tactical-text/60 font-medium">Style:</span>
                <span className="text-tactical-text capitalize font-mono bg-tactical-bg px-3 py-1 rounded">
                  {personalityProfile.style}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <span className="text-tactical-text/60 font-medium">Risk Tolerance:</span>
                <span className="text-tactical-text capitalize font-mono bg-tactical-bg px-3 py-1 rounded">
                  {personalityProfile.riskTolerance}
                </span>
              </div>
            </div>
          </div>
        )}

        {decisions.length > 0 && (
          <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 md:p-8 mt-8 md:mt-10">
            <h3 className="text-tactical-accent font-semibold text-lg md:text-xl mb-4 md:mb-6">
              Decision Backlog Loaded
            </h3>
            <p className="text-tactical-text/80 text-sm md:text-base mb-6">
              {decisions.length} decision{decisions.length > 1 ? 's' : ''} ready for tactical analysis
            </p>
            <div className="space-y-4">
              {decisions.map((decision, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm md:text-base space-y-2 sm:space-y-0 p-3 bg-tactical-bg rounded border border-tactical-border/50">
                  <span className="text-tactical-text font-medium">{decision.title}</span>
                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className="text-tactical-accent font-mono text-xs md:text-sm bg-tactical-accent/10 px-2 py-1 rounded">
                      {decision.category}
                    </span>
                    <span className="text-tactical-text/60 font-mono text-xs md:text-sm">
                      {decision.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pt-6 md:pt-8">
        <p className="text-tactical-text/60 mb-8 md:mb-10 text-sm md:text-base">
          Your command center is ready. Deploy to your tactical dashboard?
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          <Button variant="outline" onClick={prevStep} disabled={isCompleting} className="min-h-[48px] px-8 w-full sm:w-auto">
            Back
          </Button>
          <Button 
            onClick={handleCompleteOnboarding}
            disabled={isCompleting}
            className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-semibold px-8 min-h-[48px] w-full sm:w-auto"
          >
            {isCompleting ? 'DEPLOYING...' : 'DEPLOY TO DASHBOARD'}
          </Button>
        </div>
      </div>
    </div>
  );
};

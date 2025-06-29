
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Target } from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import { useDecisions } from '@/hooks/useDecisions';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ReflectionScheduling = () => {
  const { prevStep, decisions, personalityProfile } = useOnboarding();
  const { createDecision } = useDecisions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCompleteOnboarding = async () => {
    try {
      // Create all decisions in the database
      for (const decision of decisions) {
        const newDecision = {
          title: decision.title,
          category: decision.category,
          priority: 'medium' as const,
          stage: decision.stage,
          confidence: decision.confidence || 50,
          owner: user?.name || 'User',
          notes: `Created during onboarding. Reflection scheduled for 1 ${decision.reflectionInterval}.`
        };
        await createDecision(newDecision);
      }

      // Store onboarding completion
      localStorage.setItem('onboarding_completed', 'true');
      if (personalityProfile) {
        localStorage.setItem('personality_profile', JSON.stringify(personalityProfile));
      }

      toast({
        title: "Mission Command Ready!",
        description: `${decisions.length} decisions loaded into your command center.`
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "There was an issue setting up your decisions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalReflections = decisions.length * 3; // Each decision gets 3 reflection intervals

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-tactical-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-tactical-accent font-tactical mb-4">
          Command Center Ready
        </h2>
        <p className="text-tactical-text/80">
          You've got your command center ready. We'll remind you to reflect on your decisions at specific intervals.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 text-center">
          <Target className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
          <h3 className="font-semibold text-tactical-text mb-2">Decisions Loaded</h3>
          <p className="text-2xl font-bold text-tactical-accent">{decisions.length}</p>
          <p className="text-sm text-tactical-text/60">Ready for tracking</p>
        </div>

        <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
          <h3 className="font-semibold text-tactical-text mb-2">Reflections Scheduled</h3>
          <p className="text-2xl font-bold text-tactical-accent">{totalReflections}</p>
          <p className="text-sm text-tactical-text/60">7, 30, 90 day intervals</p>
        </div>

        <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 text-center">
          <CheckCircle className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
          <h3 className="font-semibold text-tactical-text mb-2">Profile Type</h3>
          <p className="text-lg font-bold text-tactical-accent">
            {personalityProfile?.profileType || 'Strategic'}
          </p>
          <p className="text-sm text-tactical-text/60">Decision maker</p>
        </div>
      </div>

      <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-6">
        <h3 className="font-semibold text-tactical-text mb-4">Your Decision Summary:</h3>
        <div className="space-y-3">
          {decisions.map((decision, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-tactical-border/30 last:border-b-0">
              <div>
                <p className="text-tactical-text font-medium">{decision.title}</p>
                <p className="text-sm text-tactical-text/60">
                  {decision.category} • {decision.confidence}% confidence • Reflect in 1 {decision.reflectionInterval}
                </p>
              </div>
              <div className="text-tactical-accent font-mono text-sm">
                {decision.stage.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-tactical-text/80">
          Your mission command center is configured and ready to help you make fewer, better decisions.
        </p>
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button 
            onClick={handleCompleteOnboarding}
            className="bg-tactical-accent hover:bg-tactical-accent/90 px-8"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

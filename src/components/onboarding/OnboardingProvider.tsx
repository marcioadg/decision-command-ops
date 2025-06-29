
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Decision, DecisionCategory, DecisionPriority, DecisionStage } from '@/types/Decision';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PersonalityProfile {
  decisionSpeed: 'fast' | 'deliberate';
  approach: 'data' | 'gut';
  style: 'collaborative' | 'solo';
  riskTolerance: 'high' | 'medium' | 'low';
  profileType: string;
}

interface OnboardingDecision {
  title: string;
  category: DecisionCategory;
  stage: DecisionStage;
  confidence: number;
  reflectionInterval?: 'week' | 'month' | 'quarter';
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  personalityProfile: PersonalityProfile | null;
  decisions: OnboardingDecision[];
  setCurrentStep: (step: number) => void;
  setPersonalityProfile: (profile: PersonalityProfile) => void;
  setDecisions: (decisions: OnboardingDecision[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [decisions, setDecisions] = useState<OnboardingDecision[]>([]);
  
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = async () => {
    try {
      await completeOnboarding();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast({
        title: "SYSTEM ERROR",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      totalSteps,
      personalityProfile,
      decisions,
      setCurrentStep,
      setPersonalityProfile,
      setDecisions,
      nextStep,
      prevStep,
      skipOnboarding,
      isFirstStep,
      isLastStep
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

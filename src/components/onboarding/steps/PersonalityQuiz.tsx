import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '../OnboardingProvider';

interface QuizAnswers {
  decisionSpeed: 'fast' | 'deliberate' | '';
  approach: 'data' | 'gut' | '';
  style: 'collaborative' | 'solo' | '';
  riskTolerance: 'high' | 'medium' | 'low' | '';
}

const questions = [
  {
    id: 'decisionSpeed',
    question: 'Decision Speed:',
    options: [
      { value: 'fast', label: 'RAPID' },
      { value: 'deliberate', label: 'METHODICAL' }
    ]
  },
  {
    id: 'approach',
    question: 'Primary Intel:',
    options: [
      { value: 'data', label: 'DATA' },
      { value: 'gut', label: 'INSTINCT' }
    ]
  },
  {
    id: 'style',
    question: 'Decision Style:',
    options: [
      { value: 'collaborative', label: 'TEAM' },
      { value: 'solo', label: 'SOLO' }
    ]
  },
  {
    id: 'riskTolerance',
    question: 'Risk Protocol:',
    options: [
      { value: 'high', label: 'AGGRESSIVE' },
      { value: 'medium', label: 'CALCULATED' },
      { value: 'low', label: 'CONSERVATIVE' }
    ]
  }
];

export const PersonalityQuiz = () => {
  const { nextStep, prevStep, setPersonalityProfile } = useOnboarding();
  const [answers, setAnswers] = useState<QuizAnswers>({
    decisionSpeed: '',
    approach: '',
    style: '',
    riskTolerance: ''
  });

  const handleAnswerChange = (questionId: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const generateProfile = (answers: QuizAnswers) => {
    const profiles = [
      {
        conditions: { decisionSpeed: 'fast', approach: 'data', style: 'solo' },
        type: 'Strategic Operator',
        description: 'You value clarity and speed. Data-driven but decisive.'
      },
      {
        conditions: { decisionSpeed: 'deliberate', approach: 'data', style: 'collaborative' },
        type: 'Analytical Leader',
        description: 'You build consensus through thorough analysis.'
      },
      {
        conditions: { decisionSpeed: 'fast', approach: 'gut', style: 'solo' },
        type: 'Intuitive Commander',
        description: 'You trust instincts and move with confidence.'
      },
      {
        conditions: { decisionSpeed: 'deliberate', approach: 'gut', style: 'collaborative' },
        type: 'Thoughtful Facilitator',
        description: 'You blend wisdom with team input for balanced decisions.'
      }
    ];

    const match = profiles.find(profile => 
      Object.entries(profile.conditions).every(([key, value]) => 
        answers[key as keyof QuizAnswers] === value
      )
    );

    return match?.type || 'Strategic Decision Maker';
  };

  const handleNext = () => {
    if (isComplete) {
      const profileType = generateProfile(answers);
      setPersonalityProfile({
        ...answers,
        profileType
      } as any);
      nextStep();
    }
  };

  const isComplete = Object.values(answers).every(answer => answer !== '');

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-tactical-accent font-tactical mb-4 md:mb-6">
          Choose Your Command Style
        </h2>
        <p className="text-tactical-text/80 text-sm md:text-base">
          Select your operational preferences
        </p>
      </div>

      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 md:p-10 mx-4 md:mx-0">
        <div className="space-y-10 md:space-y-12">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              {/* Question Header */}
              <div className="flex items-center space-x-4 pb-2">
                <span className="text-tactical-accent font-mono text-base w-8 flex-shrink-0 font-bold">
                  {index + 1}.
                </span>
                <span className="text-tactical-text font-mono text-sm md:text-base uppercase tracking-wider font-medium">
                  {question.question}
                </span>
              </div>
              
              {/* Options */}
              <div className="pl-12">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerChange(question.id as keyof QuizAnswers, option.value)}
                      className={`flex-1 px-5 md:px-6 py-4 md:py-3 rounded-lg border font-mono text-sm uppercase tracking-wider transition-all duration-200 ${
                        answers[question.id as keyof QuizAnswers] === option.value
                          ? 'bg-tactical-accent text-tactical-bg border-tactical-accent shadow-lg'
                          : 'bg-tactical-bg text-tactical-text border-tactical-border hover:border-tactical-accent/50 hover:bg-tactical-surface/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 md:pt-8 px-4 md:px-0">
        <Button variant="outline" onClick={prevStep} className="min-h-[48px] px-6">
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isComplete}
          className="bg-tactical-accent hover:bg-tactical-accent/90 min-h-[48px] px-6"
        >
          Analyze Results
        </Button>
      </div>
    </div>
  );
};


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
    question: 'Under pressure, how do you typically make decisions?',
    options: [
      { value: 'fast', label: 'Quick and decisive - trust first instinct' },
      { value: 'deliberate', label: 'Take time to analyze - thoroughness over speed' }
    ]
  },
  {
    id: 'approach',
    question: 'What do you rely on most when making tough calls?',
    options: [
      { value: 'data', label: 'Data and analysis - numbers tell the story' },
      { value: 'gut', label: 'Gut instinct - experience guides me' }
    ]
  },
  {
    id: 'style',
    question: 'How do you prefer to tackle major decisions?',
    options: [
      { value: 'collaborative', label: 'Collaborate - gather input from others' },
      { value: 'solo', label: 'Solo - I process best on my own' }
    ]
  },
  {
    id: 'riskTolerance',
    question: 'When facing uncertainty, you tend to:',
    options: [
      { value: 'high', label: 'Embrace the unknown - big risks, big rewards' },
      { value: 'medium', label: 'Calculated risks - measured approach' },
      { value: 'low', label: 'Play it safe - minimize potential downsides' }
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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-tactical-accent font-tactical mb-4">
          Choose Your Command Style
        </h2>
        <p className="text-tactical-text/80">
          How do you usually make decisions under pressure?
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-tactical-surface border border-tactical-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-tactical-text mb-4">
              {index + 1}. {question.question}
            </h3>
            <div className="space-y-3">
              {question.options.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id as keyof QuizAnswers] === option.value}
                    onChange={(e) => handleAnswerChange(question.id as keyof QuizAnswers, e.target.value)}
                    className="w-4 h-4 text-tactical-accent"
                  />
                  <span className="text-tactical-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isComplete}
          className="bg-tactical-accent hover:bg-tactical-accent/90"
        >
          Analyze Results
        </Button>
      </div>
    </div>
  );
};

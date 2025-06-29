
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useOnboarding } from '../OnboardingProvider';

interface ConfidenceData {
  confidence: number;
  reflectionInterval: 'week' | 'month' | 'quarter';
}

export const ConfidenceLevels = () => {
  const { nextStep, prevStep, decisions, setDecisions } = useOnboarding();
  const [confidenceData, setConfidenceData] = useState<ConfidenceData[]>(
    decisions.map(() => ({ confidence: 50, reflectionInterval: 'month' as const }))
  );

  const updateConfidence = (index: number, field: keyof ConfidenceData, value: any) => {
    setConfidenceData(prev => prev.map((data, i) => 
      i === index ? { ...data, [field]: value } : data
    ));
  };

  const handleNext = () => {
    const updatedDecisions = decisions.map((decision, index) => ({
      ...decision,
      confidence: confidenceData[index].confidence,
      reflectionInterval: confidenceData[index].reflectionInterval
    }));
    setDecisions(updatedDecisions);
    nextStep();
  };

  const averageConfidence = Math.round(
    confidenceData.reduce((sum, data) => sum + data.confidence, 0) / confidenceData.length
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-tactical-accent font-tactical mb-4">
          Add Confidence Levels
        </h2>
        <p className="text-tactical-text/80">
          For each decision, set your confidence level and reflection schedule
        </p>
      </div>

      <div className="space-y-6">
        {decisions.map((decision, index) => (
          <div key={index} className="bg-tactical-surface border border-tactical-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-tactical-text mb-4">
              {decision.title}
            </h3>
            <div className="text-sm text-tactical-accent mb-4">
              {decision.category} • {decision.stage.charAt(0).toUpperCase() + decision.stage.slice(1)}
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-tactical-text">
                    How confident are you?
                  </label>
                  <span className="text-tactical-accent font-semibold">
                    {confidenceData[index].confidence}%
                  </span>
                </div>
                <Slider
                  value={[confidenceData[index].confidence]}
                  onValueChange={(value) => updateConfidence(index, 'confidence', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tactical-text mb-2">
                  When should you reflect?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['week', 'month', 'quarter'] as const).map((interval) => (
                    <button
                      key={interval}
                      onClick={() => updateConfidence(index, 'reflectionInterval', interval)}
                      className={`p-2 rounded-md border text-sm ${
                        confidenceData[index].reflectionInterval === interval
                          ? 'bg-tactical-accent text-tactical-bg border-tactical-accent'
                          : 'bg-tactical-bg border-tactical-border text-tactical-text hover:border-tactical-accent/50'
                      }`}
                    >
                      1 {interval}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-tactical-surface border border-tactical-accent/30 rounded-lg p-4 text-center">
        <p className="text-tactical-text">
          You're at <span className="text-tactical-accent font-bold">{averageConfidence}%</span> average confidence across your decisions.
        </p>
        <p className="text-tactical-text/60 text-sm mt-1">
          Let's work on improving that through structured reflection.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-tactical-accent hover:bg-tactical-accent/90"
        >
          Schedule Reflections
        </Button>
      </div>
    </div>
  );
};

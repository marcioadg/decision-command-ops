
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingProvider';
import { SkipOnboardingDialog } from './SkipOnboardingDialog';

export const SkipOnboardingButton = () => {
  const { skipOnboarding } = useOnboarding();
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = async () => {
    setShowSkipDialog(false);
    await skipOnboarding();
  };

  const handleCancelSkip = () => {
    setShowSkipDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleSkipClick}
        className="text-tactical-text/60 hover:text-tactical-text/80 font-mono text-xs uppercase tracking-wider"
      >
        Skip for now
      </Button>
      
      <SkipOnboardingDialog
        isOpen={showSkipDialog}
        onConfirmSkip={handleConfirmSkip}
        onCancel={handleCancelSkip}
      />
    </>
  );
};

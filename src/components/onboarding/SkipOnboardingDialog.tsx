
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SkipOnboardingDialogProps {
  isOpen: boolean;
  onConfirmSkip: () => void;
  onCancel: () => void;
}

export const SkipOnboardingDialog = ({
  isOpen,
  onConfirmSkip,
  onCancel
}: SkipOnboardingDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-tactical-surface border-tactical-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-tactical-accent font-mono">
            SKIP MISSION BRIEFING?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-tactical-text/80 space-y-3">
            <p>You're about to skip the command setup process. You'll miss out on:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Personality profile analysis for optimized decision-making</li>
              <li>Decision backlog capture and organization</li>
              <li>Reflection scheduling for continuous improvement</li>
              <li>Tactical dashboard customization</li>
            </ul>
            <p className="text-xs text-tactical-text/60 mt-2">
              You can always complete your profile setup later from the dashboard settings.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-tactical-surface border-tactical-border text-tactical-text hover:bg-tactical-border/50 font-mono"
          >
            CONTINUE SETUP
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmSkip}
            className="bg-tactical-text/20 hover:bg-tactical-text/30 text-tactical-text font-mono"
          >
            SKIP FOR NOW
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

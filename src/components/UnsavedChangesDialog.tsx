
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

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSaveAndClose: () => void;
  onDiscardChanges: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog = ({
  isOpen,
  onSaveAndClose,
  onDiscardChanges,
  onCancel
}: UnsavedChangesDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-tactical-surface border-tactical-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-tactical-text font-mono">
            UNSAVED CHANGES DETECTED
          </AlertDialogTitle>
          <AlertDialogDescription className="text-tactical-text/80 font-mono text-sm">
            You have unsaved changes to this decision. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex space-x-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-tactical-surface border-tactical-border text-tactical-text hover:bg-tactical-border/50 font-mono"
          >
            CANCEL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscardChanges}
            className="bg-red-600 hover:bg-red-700 text-white font-mono"
          >
            DISCARD CHANGES
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onSaveAndClose}
            className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono"
          >
            SAVE & CLOSE
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

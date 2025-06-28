
import { useState, useEffect } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionForm } from './DecisionForm';
import { DecisionPreAnalysisSection } from './DecisionPreAnalysisSection';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => Promise<void>;
  onImmediateUpdate?: (decision: Decision) => void;
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  error?: string;
}

export const DecisionDetailModal = ({ 
  decision, 
  isOpen, 
  onClose, 
  onUpdate,
  onImmediateUpdate
}: DecisionDetailModalProps) => {
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [originalDecision, setOriginalDecision] = useState<Decision | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' });
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const { hasUnsavedChanges, resetChanges } = useUnsavedChanges({
    originalDecision,
    currentDecision
  });

  // Initialize decision data when modal opens
  useEffect(() => {
    if (isOpen && decision) {
      const decisionCopy = JSON.parse(JSON.stringify(decision));
      setCurrentDecision(decisionCopy);
      setOriginalDecision(decisionCopy);
      setSaveStatus({ status: 'idle' });
      console.log('DecisionDetailModal: Initialized with decision:', decision.id);
    }
  }, [isOpen, decision]);

  // Handle incoming real-time updates while modal is open
  useEffect(() => {
    if (isOpen && decision && currentDecision) {
      // Only update if the incoming decision is different and we don't have unsaved changes
      const incomingDecisionString = JSON.stringify(decision);
      const currentDecisionString = JSON.stringify(currentDecision);
      
      if (incomingDecisionString !== currentDecisionString && !hasUnsavedChanges) {
        console.log('DecisionDetailModal: Syncing with real-time update');
        const updatedDecision = JSON.parse(JSON.stringify(decision));
        setCurrentDecision(updatedDecision);
        setOriginalDecision(updatedDecision);
      } else if (hasUnsavedChanges) {
        console.log('DecisionDetailModal: Ignoring real-time update due to unsaved changes');
      }
    }
  }, [decision, hasUnsavedChanges, isOpen]);

  if (!isOpen || !decision || !currentDecision) {
    return null;
  }

  const handleFieldUpdate = (updates: Partial<Decision>) => {
    console.log('DecisionDetailModal: Field update:', updates);
    setCurrentDecision(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleSave = async () => {
    if (!currentDecision || !hasUnsavedChanges) return;

    setSaveStatus({ status: 'saving' });
    
    try {
      const updatedDecision: Decision = {
        ...currentDecision,
        updatedAt: new Date()
      };
      
      console.log('DecisionDetailModal: Saving decision:', updatedDecision);
      
      // Immediate local state update for instant UI feedback
      if (onImmediateUpdate) {
        console.log('DecisionDetailModal: Applying immediate update to global state');
        onImmediateUpdate(updatedDecision);
      }
      
      // Perform the actual database update
      await onUpdate(updatedDecision);
      
      // Update original decision to new saved state
      setOriginalDecision(JSON.parse(JSON.stringify(updatedDecision)));
      resetChanges();
      
      setSaveStatus({ status: 'saved' });
      console.log('DecisionDetailModal: Save completed successfully');
      
      // Reset to idle after showing saved status
      setTimeout(() => {
        setSaveStatus({ status: 'idle' });
      }, 2000);
      
    } catch (error) {
      console.error('DecisionDetailModal: Save failed:', error);
      
      // Revert the immediate update if database save failed
      if (onImmediateUpdate && originalDecision) {
        console.log('DecisionDetailModal: Reverting immediate update due to save failure');
        onImmediateUpdate(originalDecision);
      }
      
      setSaveStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Save failed' 
      });
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle', error: undefined });
      }, 5000);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    setShowUnsavedDialog(false);
    onClose();
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowUnsavedDialog(false);
  };

  const SaveStatusIndicator = () => {
    if (saveStatus.status === 'saving') {
      return (
        <div className="flex items-center space-x-2 text-tactical-accent">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-mono">Saving...</span>
        </div>
      );
    }
    
    if (saveStatus.status === 'error') {
      return (
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-mono">Error: {saveStatus.error}</span>
        </div>
      );
    }
    
    if (saveStatus.status === 'saved') {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-mono">Saved successfully</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-tactical-surface border border-tactical-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header with save button and status */}
          <div className="flex items-center justify-between p-6 border-b border-tactical-border">
            <h2 className="text-xl font-bold text-tactical-accent font-tactical">
              DECISION DETAILS
            </h2>
            <div className="flex items-center space-x-4">
              <SaveStatusIndicator />
              {hasUnsavedChanges && (
                <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">
                  UNSAVED CHANGES
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveStatus.status === 'saving'}
                className="flex items-center space-x-2 bg-tactical-accent text-tactical-bg px-4 py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>SAVE</span>
              </button>
              <button
                onClick={handleClose}
                className="text-tactical-text/60 hover:text-tactical-text text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Decision Form */}
            <DecisionForm
              decision={currentDecision}
              editMode={true}
              onUpdate={handleFieldUpdate}
            />

            {/* Pre-Decision Analysis Section */}
            <DecisionPreAnalysisSection
              decision={currentDecision}
              editMode={true}
              onUpdate={handleFieldUpdate}
            />

            {/* Reflection Section */}
            <DecisionReflectionSection
              decision={currentDecision}
              editMode={true}
              onUpdate={handleFieldUpdate}
            />

            {/* Timestamps */}
            <DecisionTimestamps decision={currentDecision} />
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSaveAndClose={handleSaveAndClose}
        onDiscardChanges={handleDiscardChanges}
        onCancel={handleCancelClose}
      />
    </>
  );
};

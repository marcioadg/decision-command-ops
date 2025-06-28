
import { useState, useEffect } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionModalHeader } from './DecisionModalHeader';
import { DecisionForm } from './DecisionForm';
import { DecisionPreAnalysisSection } from './DecisionPreAnalysisSection';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCoordinatedAutoSave } from '@/hooks/useCoordinatedAutoSave';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => Promise<void>;
  pauseRealtimeForDecision?: (decisionId: string, duration?: number) => void;
}

export const DecisionDetailModal = ({ 
  decision, 
  isOpen, 
  onClose, 
  onUpdate, 
  pauseRealtimeForDecision 
}: DecisionDetailModalProps) => {
  // FIXED: All hooks must be called at the top level, unconditionally
  const [inputBlocked, setInputBlocked] = useState(false);

  // Set up coordinated auto-save - always call this hook
  const { batchedSave, saveStatus } = useCoordinatedAutoSave({
    decision,
    onSave: async (updates) => {
      console.log('DecisionDetailModal: onSave called with updates:', updates);
      
      if (!decision) {
        console.log('DecisionDetailModal: No decision available for save');
        return;
      }
      
      const updatedDecision: Decision = {
        ...decision,
        ...updates,
        updatedAt: new Date()
      };
      
      console.log('DecisionDetailModal: Calling onUpdate with:', updatedDecision);
      await onUpdate(updatedDecision);
    },
    pauseRealtimeForDecision
  });

  // Pause real-time updates for the entire modal session
  useEffect(() => {
    if (isOpen && decision && pauseRealtimeForDecision) {
      console.log('DecisionDetailModal: Pausing real-time updates for editing session');
      pauseRealtimeForDecision(decision.id, 15000);
    }
  }, [decision?.id, pauseRealtimeForDecision, isOpen]);

  // Debug logging for modal state
  useEffect(() => {
    console.log('DecisionDetailModal: State debug', {
      isOpen,
      decisionId: decision?.id,
      saveStatus: saveStatus.status,
      inputBlocked
    });
  }, [isOpen, decision?.id, saveStatus.status, inputBlocked]);

  // Now we can safely return early after all hooks have been called
  if (!isOpen || !decision) {
    console.log('DecisionDetailModal: Not rendering - isOpen:', isOpen, 'decision:', !!decision);
    return null;
  }

  const handleUpdate = async (updates: Partial<Decision>) => {
    console.log('DecisionDetailModal: handleUpdate called with:', updates);
    
    // Temporarily block inputs during save
    setInputBlocked(true);
    
    try {
      await batchedSave(updates);
      console.log('DecisionDetailModal: batchedSave completed successfully');
    } catch (error) {
      console.error('DecisionDetailModal: Error in handleUpdate:', error);
    } finally {
      // Re-enable inputs after save attempt
      setTimeout(() => setInputBlocked(false), 100);
    }
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
    
    if (saveStatus.status === 'saved' && saveStatus.lastSaved) {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-mono">
            Saved {saveStatus.lastSaved.toLocaleTimeString()}
          </span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with save status */}
        <div className="flex items-center justify-between p-6 border-b border-tactical-border">
          <h2 className="text-xl font-bold text-tactical-accent font-tactical">
            DECISION DETAILS
          </h2>
          <div className="flex items-center space-x-4">
            <SaveStatusIndicator />
            <button
              onClick={onClose}
              className="text-tactical-text/60 hover:text-tactical-text text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Decision Form - always in edit mode */}
          <DecisionForm
            decision={decision}
            editMode={true}
            onUpdate={handleUpdate}
            disabled={inputBlocked}
          />

          {/* Pre-Decision Analysis Section */}
          <DecisionPreAnalysisSection
            decision={decision}
            editMode={true}
            onUpdate={handleUpdate}
            disabled={inputBlocked}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={decision}
            editMode={true}
            onUpdate={handleUpdate}
            disabled={inputBlocked}
          />

          {/* Timestamps */}
          <DecisionTimestamps decision={decision} />
        </div>
      </div>
    </div>
  );
};

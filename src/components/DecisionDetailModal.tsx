
import { useState } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionModalHeader } from './DecisionModalHeader';
import { DecisionForm } from './DecisionForm';
import { DecisionPreAnalysisSection } from './DecisionPreAnalysisSection';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';
import { useAutoSave } from '@/hooks/useAutoSave';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => Promise<void>;
}

export const DecisionDetailModal = ({ decision, isOpen, onClose, onUpdate }: DecisionDetailModalProps) => {
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Decision>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Don't render if not open or no decision
  if (!isOpen || !decision) {
    return null;
  }

  const handleUpdate = async (updates: Partial<Decision>) => {
    console.log('DecisionDetailModal: Handling update:', updates);
    
    // Store pending updates
    setPendingUpdates(prev => ({ ...prev, ...updates }));
    
    // Apply updates to decision and save immediately
    const updatedDecision: Decision = {
      ...decision,
      ...updates,
      updatedAt: new Date()
    };
    
    try {
      setIsSaving(true);
      console.log('DecisionDetailModal: Saving updated decision:', updatedDecision);
      await onUpdate(updatedDecision);
      console.log('DecisionDetailModal: Save completed successfully');
      
      // Clear pending updates after successful save
      setPendingUpdates({});
    } catch (error) {
      console.error('DecisionDetailModal: Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Merge decision with pending updates for display
  const displayDecision = { ...decision, ...pendingUpdates };

  const SaveStatusIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center space-x-2 text-tactical-accent">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-mono">Saving...</span>
        </div>
      );
    }
    
    if (Object.keys(pendingUpdates).length === 0) {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-mono">Saved</span>
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
            decision={displayDecision}
            editMode={true}
            onUpdate={handleUpdate}
          />

          {/* Pre-Decision Analysis Section */}
          <DecisionPreAnalysisSection
            decision={displayDecision}
            editMode={true}
            onUpdate={handleUpdate}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={displayDecision}
            editMode={true}
            onUpdate={handleUpdate}
          />

          {/* Timestamps */}
          <DecisionTimestamps decision={decision} />
        </div>
      </div>
    </div>
  );
};

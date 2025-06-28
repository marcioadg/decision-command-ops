
import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState<Decision | null>(null);

  // Initialize formData when decision changes
  useEffect(() => {
    if (decision) {
      console.log('DecisionDetailModal: Initializing form data with decision:', decision);
      setFormData({ ...decision });
    }
  }, [decision]);

  const handleAutoSave = async (data: Decision) => {
    console.log('DecisionDetailModal: Auto-saving decision:', data);
    const updatedDecision: Decision = {
      ...data,
      updatedAt: new Date()
    };
    console.log('DecisionDetailModal: Calling onUpdate with:', updatedDecision);
    await onUpdate(updatedDecision);
    console.log('DecisionDetailModal: Auto-save completed');
  };

  // Set up auto-save with 1 second delay and get save status
  const saveStatus = useAutoSave({
    data: formData || {} as Decision,
    onSave: handleAutoSave,
    delay: 1000
  });

  // Don't render if not open or no decision
  if (!isOpen || !decision || !formData) {
    return null;
  }

  const handleFormUpdate = (updates: Partial<Decision>) => {
    console.log('DecisionDetailModal: Form update received:', updates);
    setFormData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      console.log('DecisionDetailModal: Updated form data:', updated);
      return updated;
    });
  };

  const SaveStatusIndicator = () => {
    switch (saveStatus.status) {
      case 'saving':
        return (
          <div className="flex items-center space-x-2 text-tactical-accent">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-mono">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-mono">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-mono">Save failed</span>
          </div>
        );
      default:
        return null;
    }
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
            decision={formData}
            editMode={true}
            onUpdate={handleFormUpdate}
          />

          {/* Pre-Decision Analysis Section */}
          <DecisionPreAnalysisSection
            decision={formData}
            editMode={true}
            onUpdate={handleFormUpdate}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={formData}
            editMode={true}
            onUpdate={handleFormUpdate}
          />

          {/* Timestamps */}
          <DecisionTimestamps decision={decision} />
        </div>
      </div>
    </div>
  );
};

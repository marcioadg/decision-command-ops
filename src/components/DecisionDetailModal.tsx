
import { useState, useEffect } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionModalHeader } from './DecisionModalHeader';
import { DecisionForm } from './DecisionForm';
import { DecisionPreAnalysisSection } from './DecisionPreAnalysisSection';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Don't render if not open or no decision
  if (!isOpen || !decision) {
    return null;
  }

  // Pause real-time updates for the entire modal session
  useEffect(() => {
    if (decision && pauseRealtimeForDecision) {
      console.log('DecisionDetailModal: Pausing real-time updates for editing session');
      pauseRealtimeForDecision(decision.id, 10000); // 10 second pause for editing
    }
  }, [decision?.id, pauseRealtimeForDecision]);

  const handleUpdate = async (updates: Partial<Decision>) => {
    if (!decision) return;
    
    console.log('DecisionDetailModal: Handling update:', updates);
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Pause real-time updates during save
      if (pauseRealtimeForDecision) {
        pauseRealtimeForDecision(decision.id, 5000);
      }
      
      const updatedDecision: Decision = {
        ...decision,
        ...updates,
        updatedAt: new Date()
      };
      
      console.log('DecisionDetailModal: Saving updated decision:', updatedDecision);
      await onUpdate(updatedDecision);
      console.log('DecisionDetailModal: Save completed successfully');
      
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('DecisionDetailModal: Save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const SaveStatusIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center space-x-2 text-tactical-accent">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-mono">Saving...</span>
        </div>
      );
    }
    
    if (saveError) {
      return (
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-mono">Error: {saveError}</span>
        </div>
      );
    }
    
    if (lastSaveTime) {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-mono">
            Saved {lastSaveTime.toLocaleTimeString()}
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
          />

          {/* Pre-Decision Analysis Section */}
          <DecisionPreAnalysisSection
            decision={decision}
            editMode={true}
            onUpdate={handleUpdate}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={decision}
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

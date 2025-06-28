
import { useState, useEffect } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionModalHeader } from './DecisionModalHeader';
import { DecisionForm } from './DecisionForm';
import { DecisionPreAnalysisSection } from './DecisionPreAnalysisSection';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';
import { DecisionModalFooter } from './DecisionModalFooter';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => void;
}

export const DecisionDetailModal = ({ decision, isOpen, onClose, onUpdate }: DecisionDetailModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Decision | null>(null);

  // Only sync formData when entering edit mode
  useEffect(() => {
    if (editMode && decision) {
      setFormData({ ...decision });
    } else if (!editMode) {
      setFormData(null);
    }
  }, [decision, editMode]);

  // Don't render if not open or no decision
  if (!isOpen || !decision) {
    return null;
  }

  const handleSave = () => {
    if (formData) {
      console.log('Saving decision with all data:', formData);
      // Ensure we save the complete formData including all sections
      const updatedDecision: Decision = {
        ...formData,
        updatedAt: new Date()
      };
      onUpdate(updatedDecision);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    // Reset form data and exit edit mode
    setFormData(null);
    setEditMode(false);
  };

  const handleEditMode = () => {
    if (!editMode) {
      // Entering edit mode - populate form with current decision
      setFormData({ ...decision });
    }
    setEditMode(!editMode);
  };

  const handleFormUpdate = (updates: Partial<Decision>) => {
    console.log('Updating form data with:', updates);
    setFormData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      console.log('Updated form data:', updated);
      return updated;
    });
  };

  // Use formData in edit mode, otherwise use original decision for display
  const displayData = editMode && formData ? formData : decision;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DecisionModalHeader
          decision={decision}
          editMode={editMode}
          onEditToggle={handleEditMode}
          onClose={onClose}
        />

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Decision Form */}
          <DecisionForm
            decision={displayData}
            editMode={editMode}
            onUpdate={handleFormUpdate}
          />

          {/* Pre-Decision Analysis Section */}
          <DecisionPreAnalysisSection
            decision={displayData}
            editMode={editMode}
            onUpdate={handleFormUpdate}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={displayData}
            editMode={editMode}
            onUpdate={handleFormUpdate}
          />

          {/* Timestamps */}
          <DecisionTimestamps decision={decision} />
        </div>

        {/* Footer */}
        <DecisionModalFooter
          editMode={editMode}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

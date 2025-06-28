
import { useState, useEffect } from 'react';
import { Decision } from '@/types/Decision';
import { DecisionModalHeader } from './DecisionModalHeader';
import { DecisionForm } from './DecisionForm';
import { DecisionReflectionSection } from './DecisionReflectionSection';
import { DecisionTimestamps } from './DecisionTimestamps';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => void;
}

export const DecisionDetailModal = ({ decision, isOpen, onClose, onUpdate }: DecisionDetailModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Decision | null>(null);

  // Sync formData when decision prop changes
  useEffect(() => {
    if (decision) {
      setFormData({ ...decision });
    }
  }, [decision]);

  // Don't render if not open or no decision
  if (!isOpen || !decision || !formData) {
    return null;
  }

  const handleSave = () => {
    if (formData) {
      onUpdate({ ...formData, updatedAt: new Date() });
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original decision
    setFormData({ ...decision });
    setEditMode(false);
  };

  const handleEditMode = () => {
    if (!editMode) {
      // Entering edit mode - ensure we have fresh copy of current decision
      setFormData({ ...decision });
    }
    setEditMode(!editMode);
  };

  const handleFormUpdate = (updates: Partial<Decision>) => {
    setFormData(prev => prev ? ({ ...prev, ...updates }) : null);
  };

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
            decision={formData}
            editMode={editMode}
            onUpdate={handleFormUpdate}
          />

          {/* Reflection Section */}
          <DecisionReflectionSection
            decision={formData}
            editMode={editMode}
            onUpdate={handleFormUpdate}
          />

          {/* Timestamps */}
          <DecisionTimestamps decision={decision} />
        </div>

        {/* Footer */}
        {editMode && (
          <div className="flex space-x-3 p-6 border-t border-tactical-border">
            <button
              onClick={handleCancel}
              className="flex-1 bg-tactical-surface border border-tactical-border text-tactical-text py-2 rounded font-mono text-sm hover:bg-tactical-border/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-tactical-accent text-tactical-bg py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors"
            >
              SAVE CHANGES
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

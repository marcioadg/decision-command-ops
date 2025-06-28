
import { useState } from 'react';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';
import { QuickAddFormFields } from './QuickAddFormFields';
import { QuickAddFormActions } from './QuickAddFormActions';

interface QuickAddFormProps {
  onAdd: (decision: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const QuickAddForm = ({ onAdd, onCancel }: QuickAddFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Strategy' as DecisionCategory,
    impact: 'medium' as DecisionImpact,
    urgency: 'medium' as DecisionUrgency,
    confidence: 50,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const newDecision: Omit<Decision, 'id' | 'createdAt'> = {
          ...formData,
          stage: 'backlog',
          owner: 'System' // Default fallback for backward compatibility
        };
        await onAdd(newDecision);
        setFormData({
          title: '',
          category: 'Strategy',
          impact: 'medium',
          urgency: 'medium',
          confidence: 50,
          notes: ''
        });
        onCancel();
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdate = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <QuickAddFormFields
        formData={formData}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
      />
      
      <QuickAddFormActions
        onCancel={onCancel}
        isValid={!!formData.title.trim()}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

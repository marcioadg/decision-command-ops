
import { useState } from 'react';
import { Decision, DecisionCategory, DecisionPriority } from '@/types/Decision';
import { QuickAddFormFields } from './QuickAddFormFields';
import { QuickAddFormActions } from './QuickAddFormActions';

interface QuickAddFormProps {
  onAdd: (decision: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

export const QuickAddForm = ({ onAdd, onCancel }: QuickAddFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '' as DecisionCategory | '',
    priority: '' as DecisionPriority | '',
    confidence: '' as number | '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.category && formData.priority && formData.confidence !== '' && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const newDecision: Omit<Decision, 'id' | 'createdAt'> = {
          title: formData.title,
          category: formData.category as DecisionCategory,
          priority: formData.priority as DecisionPriority,
          confidence: formData.confidence as number,
          notes: formData.notes,
          stage: 'backlog',
          owner: 'System' // Default fallback for backward compatibility
        };
        await onAdd(newDecision);
        setFormData({
          title: '',
          category: '',
          priority: '',
          confidence: '',
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

  const isValid = !!(
    formData.title.trim() && 
    formData.category && 
    formData.priority && 
    formData.confidence !== ''
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <QuickAddFormFields
        formData={formData}
        onUpdate={handleUpdate}
        isSubmitting={isSubmitting}
      />
      
      <QuickAddFormActions
        onCancel={onCancel}
        isValid={isValid}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

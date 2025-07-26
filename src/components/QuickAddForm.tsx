
import { useState } from 'react';
import { Decision, DecisionCategory, DecisionPriority, DecisionStage } from '@/types/Decision';
import { QuickAddFormFields } from './QuickAddFormFields';
import { QuickAddFormActions } from './QuickAddFormActions';

interface QuickAddFormProps {
  onAdd: (decision: Omit<Decision, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  preFilledData?: {
    title?: string;
    notes?: string;
    stage?: DecisionStage;
  };
}

export const QuickAddForm = ({ onAdd, onCancel, preFilledData }: QuickAddFormProps) => {
  const [formData, setFormData] = useState({
    title: preFilledData?.title || '',
    category: '' as DecisionCategory | '',
    priority: '' as DecisionPriority | '',
    confidence: '' as number | '',
    notes: preFilledData?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('QuickAddForm: handleSubmit called - ENTRY POINT');
    console.log('QuickAddForm: Form submitted with data:', formData);
    console.log('QuickAddForm: Validation check:', {
      title: formData.title.trim(),
      category: formData.category,
      priority: formData.priority,
      confidence: formData.confidence,
      isSubmitting
    });
    
    if (formData.title.trim() && formData.category && formData.priority && formData.confidence !== '' && !isSubmitting) {
      console.log('QuickAddForm: Validation PASSED - proceeding with submission');
      setIsSubmitting(true);
      try {
        const newDecision: Omit<Decision, 'id' | 'createdAt'> = {
          title: formData.title,
          category: formData.category as DecisionCategory,
          priority: formData.priority as DecisionPriority,
          confidence: formData.confidence as number,
          notes: formData.notes,
          stage: preFilledData?.stage || 'backlog',
          owner: 'System' // Default fallback for backward compatibility
        };
        console.log('QuickAddForm: Calling onAdd with decision:', newDecision);
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
        console.error('QuickAddForm: Error in form submission:', error);
        // Error is handled by the parent component
      } finally {
        console.log('QuickAddForm: Submission complete, resetting isSubmitting');
        setIsSubmitting(false);
      }
    } else {
      console.log('QuickAddForm: Validation FAILED - form not submitted');
      console.log('QuickAddForm: Validation details:', {
        titleValid: !!formData.title.trim(),
        categoryValid: !!formData.category,
        priorityValid: !!formData.priority,
        confidenceValid: formData.confidence !== '',
        notSubmitting: !isSubmitting
      });
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

  console.log('QuickAddForm: Render - Form validation state:', {
    isValid,
    formData,
    isSubmitting
  });

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

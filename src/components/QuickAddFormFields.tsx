
import { DecisionCategory, DecisionPriority } from '@/types/Decision';

interface FormData {
  title: string;
  category: DecisionCategory | '';
  priority: DecisionPriority | '';
  confidence: number | '';
  notes: string;
}

interface QuickAddFormFieldsProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  isSubmitting: boolean;
}

export const QuickAddFormFields = ({ formData, onUpdate, isSubmitting }: QuickAddFormFieldsProps) => {
  
  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const priorities: DecisionPriority[] = ['high', 'medium', 'low'];
  const confidenceOptions = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
          Decision Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
          placeholder="Enter decision title..."
          autoFocus
          disabled={isSubmitting}
        />
      </div>

      {/* Category and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onUpdate({ category: e.target.value as DecisionCategory | '' })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => onUpdate({ priority: e.target.value as DecisionPriority | '' })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            <option value="">Select priority...</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
          Confidence
        </label>
        <select
          value={formData.confidence}
          onChange={(e) => onUpdate({ confidence: e.target.value === '' ? '' : parseInt(e.target.value) })}
          className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
          disabled={isSubmitting}
        >
          <option value="">Select confidence...</option>
          {confidenceOptions.map(percentage => (
            <option key={percentage} value={percentage}>{percentage}%</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-20 resize-none"
          placeholder="Additional context..."
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

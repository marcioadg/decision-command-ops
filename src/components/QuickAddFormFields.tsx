
import { DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';

interface QuickAddFormFieldsProps {
  formData: {
    title: string;
    category: DecisionCategory;
    impact: DecisionImpact;
    urgency: DecisionUrgency;
    confidence: number;
    owner: string;
    notes: string;
  };
  onUpdate: (updates: Partial<typeof formData>) => void;
  isSubmitting: boolean;
}

export const QuickAddFormFields = ({ formData, onUpdate, isSubmitting }: QuickAddFormFieldsProps) => {
  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const impacts: DecisionImpact[] = ['high', 'medium', 'low'];
  const urgencies: DecisionUrgency[] = ['high', 'medium', 'low'];
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

      {/* Category and Impact Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onUpdate({ category: e.target.value as DecisionCategory })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Impact
          </label>
          <select
            value={formData.impact}
            onChange={(e) => onUpdate({ impact: e.target.value as DecisionImpact })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            {impacts.map(impact => (
              <option key={impact} value={impact}>{impact.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Urgency and Confidence Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Urgency
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => onUpdate({ urgency: e.target.value as DecisionUrgency })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            {urgencies.map(urgency => (
              <option key={urgency} value={urgency}>{urgency.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
            Confidence
          </label>
          <select
            value={formData.confidence}
            onChange={(e) => onUpdate({ confidence: parseInt(e.target.value) })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            disabled={isSubmitting}
          >
            {confidenceOptions.map(percentage => (
              <option key={percentage} value={percentage}>{percentage}%</option>
            ))}
          </select>
        </div>
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

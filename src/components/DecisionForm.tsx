
import { Decision, DecisionCategory, DecisionPriority } from '@/types/Decision';

interface DecisionFormProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionForm = ({ decision, editMode, onUpdate }: DecisionFormProps) => {
  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const priorities: DecisionPriority[] = ['high', 'medium', 'low'];
  
  // Generate confidence options from 0 to 100 in 10% increments
  const confidenceOptions = Array.from({ length: 11 }, (_, i) => i * 10);

  // FIXED: Direct updates without debouncing - let parent handle batching
  const handleFieldUpdate = (field: keyof Decision, value: any) => {
    console.log('DecisionForm: Field update:', field, value);
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Title</label>
        <input
          type="text"
          value={decision.title || ''}
          onChange={(e) => handleFieldUpdate('title', e.target.value)}
          className="w-full bg-transparent border-0 border-b border-tactical-border/50 focus:border-tactical-accent rounded-none px-0 py-2 text-tactical-text focus:outline-none text-lg font-semibold"
          placeholder="Enter decision title..."
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Category</label>
          <select
            value={decision.category || ''}
            onChange={(e) => handleFieldUpdate('category', e.target.value as DecisionCategory)}
            className="w-full bg-transparent border-0 border-b border-tactical-border/50 focus:border-tactical-accent rounded-none px-0 py-2 text-tactical-text focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Priority</label>
          <select
            value={decision.priority || ''}
            onChange={(e) => handleFieldUpdate('priority', e.target.value as DecisionPriority)}
            className="w-full bg-transparent border-0 border-b border-tactical-border/50 focus:border-tactical-accent rounded-none px-0 py-2 text-tactical-text focus:outline-none"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Confidence</label>
          <select
            value={decision.confidence || 50}
            onChange={(e) => handleFieldUpdate('confidence', parseInt(e.target.value))}
            className="w-full bg-transparent border-0 border-b border-tactical-border/50 focus:border-tactical-accent rounded-none px-0 py-2 text-tactical-text focus:outline-none"
          >
            {confidenceOptions.map(percentage => (
              <option key={percentage} value={percentage}>{percentage}%</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Notes</label>
        <textarea
          value={decision.notes || ''}
          onChange={(e) => handleFieldUpdate('notes', e.target.value)}
          className="w-full bg-transparent border border-tactical-border/50 focus:border-tactical-accent rounded px-3 py-2 text-tactical-text focus:outline-none h-32 resize-none"
          placeholder="Additional context and details..."
        />
      </div>
    </div>
  );
};

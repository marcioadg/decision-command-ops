
import { useState } from 'react';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';
import { Star } from 'lucide-react';

interface DecisionFormProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionForm = ({ decision, editMode, onUpdate }: DecisionFormProps) => {
  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const impacts: DecisionImpact[] = ['high', 'medium', 'low'];
  const urgencies: DecisionUrgency[] = ['high', 'medium', 'low'];

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 cursor-pointer transition-colors ${
          i < (decision.confidence || 0) ? 'text-tactical-accent fill-tactical-accent' : 'text-tactical-text/30 hover:text-tactical-accent/50'
        }`}
        onClick={() => editMode && onUpdate({ confidence: i + 1 })}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Title</label>
        {editMode ? (
          <input
            type="text"
            value={decision.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
          />
        ) : (
          <p className="text-tactical-text font-semibold">{decision.title}</p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Category</label>
          {editMode ? (
            <select
              value={decision.category || ''}
              onChange={(e) => onUpdate({ category: e.target.value as DecisionCategory })}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          ) : (
            <p className="text-tactical-text">{decision.category}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Impact</label>
          {editMode ? (
            <select
              value={decision.impact || ''}
              onChange={(e) => onUpdate({ impact: e.target.value as DecisionImpact })}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            >
              {impacts.map(impact => (
                <option key={impact} value={impact}>{impact.toUpperCase()}</option>
              ))}
            </select>
          ) : (
            <p className="text-tactical-text">{decision.impact.toUpperCase()}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Urgency</label>
          {editMode ? (
            <select
              value={decision.urgency || ''}
              onChange={(e) => onUpdate({ urgency: e.target.value as DecisionUrgency })}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            >
              {urgencies.map(urgency => (
                <option key={urgency} value={urgency}>{urgency.toUpperCase()}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-tactical-text">{decision.urgency.toUpperCase()}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Confidence</label>
          <div className="flex items-center space-x-1">
            {renderStars()}
            <span className="ml-2 text-tactical-text/60 font-mono text-sm">
              {decision.confidence}/5
            </span>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Owner</label>
        {editMode ? (
          <input
            type="text"
            value={decision.owner || ''}
            onChange={(e) => onUpdate({ owner: e.target.value })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
          />
        ) : (
          <p className="text-tactical-text">{decision.owner}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Notes</label>
        {editMode ? (
          <textarea
            value={decision.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-32 resize-none"
            placeholder="Additional context and details..."
          />
        ) : (
          <p className="text-tactical-text/80 whitespace-pre-wrap">
            {decision.notes || 'No notes added yet.'}
          </p>
        )}
      </div>
    </div>
  );
};

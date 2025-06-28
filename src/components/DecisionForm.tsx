
import { useState } from 'react';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';

interface DecisionFormProps {
  decision: Decision;
  editMode: boolean;
  onUpdate: (updatedDecision: Partial<Decision>) => void;
}

export const DecisionForm = ({ decision, editMode, onUpdate }: DecisionFormProps) => {
  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const impacts: DecisionImpact[] = ['high', 'medium', 'low'];
  const urgencies: DecisionUrgency[] = ['high', 'medium', 'low'];
  
  // Generate confidence options from 0 to 100 in 10% increments
  const confidenceOptions = Array.from({ length: 11 }, (_, i) => i * 10);

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
          {editMode ? (
            <select
              value={decision.confidence || 50}
              onChange={(e) => onUpdate({ confidence: parseInt(e.target.value) })}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
            >
              {confidenceOptions.map(percentage => (
                <option key={percentage} value={percentage}>{percentage}%</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-tactical-accent/20 text-tactical-accent px-2 py-1 rounded text-sm font-mono">
                {decision.confidence}%
              </div>
            </div>
          )}
        </div>
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


import { useState } from 'react';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (decision: Decision) => void;
}

export const QuickAddModal = ({ isOpen, onClose, onAdd }: QuickAddModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Strategy' as DecisionCategory,
    impact: 'medium' as DecisionImpact,
    urgency: 'medium' as DecisionUrgency,
    confidence: 3,
    owner: 'CEO',
    notes: ''
  });

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const newDecision: Decision = {
        id: crypto.randomUUID(),
        ...formData,
        stage: 'backlog',
        createdAt: new Date()
      };
      onAdd(newDecision);
      setFormData({
        title: '',
        category: 'Strategy',
        impact: 'medium',
        urgency: 'medium',
        confidence: 3,
        owner: 'CEO',
        notes: ''
      });
      onClose();
    }
  };

  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const impacts: DecisionImpact[] = ['high', 'medium', 'low'];
  const urgencies: DecisionUrgency[] = ['high', 'medium', 'low'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg p-6 w-full max-w-md mx-4 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-tactical-accent font-tactical">
            NEW DECISION
          </h2>
          <button
            onClick={onClose}
            className="text-tactical-text/60 hover:text-tactical-text text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
              Decision Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
              placeholder="Enter decision title..."
              autoFocus
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
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as DecisionCategory }))}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
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
                onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value as DecisionImpact }))}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
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
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as DecisionUrgency }))}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
              >
                {urgencies.map(urgency => (
                  <option key={urgency} value={urgency}>{urgency.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
                Confidence (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.confidence}
                onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                className="w-full accent-tactical-accent"
              />
              <div className="text-center text-tactical-accent font-mono text-sm mt-1">
                {formData.confidence}/5
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-20 resize-none"
              placeholder="Additional context..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-tactical-surface border border-tactical-border text-tactical-text py-2 rounded font-mono text-sm hover:bg-tactical-border/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="flex-1 bg-tactical-accent text-tactical-bg py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ADD DECISION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

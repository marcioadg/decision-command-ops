import { useState } from 'react';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency } from '@/types/Decision';
import { X, Star, Clock } from 'lucide-react';

interface DecisionDetailModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (decision: Decision) => void;
}

export const DecisionDetailModal = ({ decision, isOpen, onClose, onUpdate }: DecisionDetailModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(decision);

  // Don't render if not open or no decision
  if (!isOpen || !decision) {
    return null;
  }

  const handleSave = () => {
    if (formData) {
      onUpdate({ ...formData, updatedAt: new Date() });
      setEditMode(false);
    }
  };

  const categories: DecisionCategory[] = ['People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal'];
  const impacts: DecisionImpact[] = ['high', 'medium', 'low'];
  const urgencies: DecisionUrgency[] = ['high', 'medium', 'low'];

  const getCategoryBadgeColor = () => {
    switch (decision.category) {
      case 'People': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Capital': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Strategy': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Product': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Timing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Personal': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 cursor-pointer transition-colors ${
          i < (formData?.confidence || 0) ? 'text-tactical-accent fill-tactical-accent' : 'text-tactical-text/30 hover:text-tactical-accent/50'
        }`}
        onClick={() => editMode && formData && setFormData(prev => prev ? ({ ...prev, confidence: i + 1 }) : null)}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-tactical-surface border border-tactical-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tactical-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-tactical-accent font-tactical">
              DECISION DETAILS
            </h2>
            <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
              {decision.category}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="hud-metric hover:bg-tactical-accent hover:text-tactical-bg transition-colors"
            >
              {editMode ? 'VIEW' : 'EDIT'}
            </button>
            <button
              onClick={onClose}
              className="text-tactical-text/60 hover:text-tactical-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Title</label>
            {editMode ? (
              <input
                type="text"
                value={formData?.title || ''}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
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
                  value={formData?.category || ''}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, category: e.target.value as DecisionCategory }) : null)}
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
                  value={formData?.impact || ''}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, impact: e.target.value as DecisionImpact }) : null)}
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
                  value={formData?.urgency || ''}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, urgency: e.target.value as DecisionUrgency }) : null)}
                  className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none"
                >
                  {urgencies.map(urgency => (
                    <option key={urgency} value={urgency}>{urgency.toUpperCase()}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-tactical-text/60" />
                  <span className="text-tactical-text">{decision.urgency.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Confidence</label>
              <div className="flex items-center space-x-1">
                {renderStars()}
                <span className="ml-2 text-tactical-text/60 font-mono text-sm">
                  {editMode ? formData?.confidence || 0 : decision.confidence}/5
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
                value={formData?.owner || ''}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, owner: e.target.value }) : null)}
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
                value={formData?.notes || ''}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-32 resize-none"
                placeholder="Additional context and details..."
              />
            ) : (
              <p className="text-tactical-text/80 whitespace-pre-wrap">
                {decision.notes || 'No notes added yet.'}
              </p>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-tactical-border">
            <div>
              <label className="block text-xs font-mono text-tactical-text/80 mb-1 uppercase">Created</label>
              <p className="text-tactical-text/60 font-mono text-sm">
                {decision.createdAt.toLocaleDateString()} {decision.createdAt.toLocaleTimeString()}
              </p>
            </div>
            {decision.updatedAt && (
              <div>
                <label className="block text-xs font-mono text-tactical-text/80 mb-1 uppercase">Last Updated</label>
                <p className="text-tactical-text/60 font-mono text-sm">
                  {decision.updatedAt.toLocaleDateString()} {decision.updatedAt.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {editMode && (
          <div className="flex space-x-3 p-6 border-t border-tactical-border">
            <button
              onClick={() => setEditMode(false)}
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

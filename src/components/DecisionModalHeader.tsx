
import { Decision } from '@/types/Decision';
import { X } from 'lucide-react';

interface DecisionModalHeaderProps {
  decision: Decision;
  editMode: boolean;
  onEditToggle: () => void;
  onClose: () => void;
}

export const DecisionModalHeader = ({ decision, editMode, onEditToggle, onClose }: DecisionModalHeaderProps) => {
  const getCategoryBadgeColor = () => {
    switch (decision.category) {
      case 'People': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Capital': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Strategy': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'Product': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'Timing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Personal': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
    }
  };

  const hasReflection = decision.reflection?.sevenDay || decision.reflection?.thirtyDay || decision.reflection?.ninetyDay || decision.reflection?.questions?.length;
  const isReflectionComplete = decision.reflection?.sevenDay?.answers?.length || decision.reflection?.thirtyDay?.answers?.length || decision.reflection?.ninetyDay?.answers?.length;

  return (
    <div className="flex items-center justify-between p-6 border-b border-tactical-border">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-tactical-accent font-tactical">
          DECISION DETAILS
        </h2>
        <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
          {decision.category}
        </span>
        {hasReflection && (
          <span className={`px-2 py-1 text-xs font-mono rounded border ${
            isReflectionComplete 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          }`}>
            {isReflectionComplete ? 'REFLECTED' : 'REFLECTION SET'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEditToggle}
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
  );
};

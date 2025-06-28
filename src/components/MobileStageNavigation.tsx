
import { Decision, DecisionStage } from '@/types/Decision';

interface MobileStageNavigationProps {
  stages: { key: DecisionStage; label: string; description: string }[];
  activeStage: DecisionStage;
  onStageChange: (stage: DecisionStage) => void;
  decisions: Decision[];
  showArchived: boolean;
}

export const MobileStageNavigation = ({
  stages,
  activeStage,
  onStageChange,
  decisions,
  showArchived
}: MobileStageNavigationProps) => {
  const getStageCount = (stage: DecisionStage) => {
    return decisions.filter(d => 
      d.stage === stage && 
      (showArchived ? d.archived : !d.archived)
    ).length;
  };

  const getStageColor = (stage: DecisionStage) => {
    switch (stage) {
      case 'backlog': return 'border-tactical-text/50';
      case 'considering': return 'border-urgency-medium';
      case 'committed': return 'border-tactical-accent';
      case 'decided': return 'border-impact-high';
      default: return 'border-tactical-border';
    }
  };

  return (
    <div className="flex bg-tactical-surface/30 border-b border-tactical-border overflow-x-auto">
      {stages.map((stage) => {
        const isActive = activeStage === stage.key;
        const count = getStageCount(stage.key);
        
        return (
          <button
            key={stage.key}
            onClick={() => onStageChange(stage.key)}
            className={`
              flex-shrink-0 px-4 py-3 min-w-0 flex flex-col items-center space-y-1
              border-b-2 transition-all duration-200
              ${isActive 
                ? `${getStageColor(stage.key)} bg-tactical-surface/50` 
                : 'border-transparent hover:bg-tactical-surface/30'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xs font-bold ${
                isActive ? 'text-tactical-accent' : 'text-tactical-text/70'
              }`}>
                {stage.label}
              </span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-mono
                ${isActive 
                  ? 'bg-tactical-accent/20 text-tactical-accent' 
                  : 'bg-tactical-surface text-tactical-text/60'
                }
              `}>
                {count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

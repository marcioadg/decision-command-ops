
import { Decision, DecisionStage } from '@/types/Decision';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ArrowRight } from 'lucide-react';

interface MoveDecisionSheetProps {
  decision: Decision | null;
  stages: { key: DecisionStage; label: string; description: string }[];
  isOpen: boolean;
  onClose: () => void;
  onMove: (decision: Decision, newStage: DecisionStage) => void;
}

export const MoveDecisionSheet = ({
  decision,
  stages,
  isOpen,
  onClose,
  onMove
}: MoveDecisionSheetProps) => {
  if (!decision) return null;

  const handleMove = (newStage: DecisionStage) => {
    onMove(decision, newStage);
  };

  const getStageColor = (stage: DecisionStage) => {
    switch (stage) {
      case 'backlog': return 'border-tactical-text/50 hover:bg-tactical-text/10';
      case 'considering': return 'border-urgency-medium hover:bg-urgency-medium/10';
      case 'committed': return 'border-tactical-accent hover:bg-tactical-accent/10';
      case 'executed': return 'border-impact-high hover:bg-impact-high/10';
      default: return 'border-tactical-border hover:bg-tactical-surface/50';
    }
  };

  const availableStages = stages.filter(stage => stage.key !== decision.stage);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-tactical-surface border-tactical-border">
        <SheetHeader className="text-left">
          <SheetTitle className="text-tactical-accent font-mono">
            Move Decision
          </SheetTitle>
          <SheetDescription className="text-tactical-text/60 font-mono">
            "{decision.title}"
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {availableStages.map((stage) => (
            <button
              key={stage.key}
              onClick={() => handleMove(stage.key)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all duration-200
                flex items-center justify-between group ${getStageColor(stage.key)}
              `}
            >
              <div className="text-left">
                <div className="font-mono font-bold text-tactical-text">
                  {stage.label}
                </div>
                <div className="text-sm text-tactical-text/60 font-mono">
                  {stage.description}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-tactical-text/40 group-hover:text-tactical-accent transition-colors" />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 rounded-lg border border-tactical-border bg-tactical-surface/50 hover:bg-tactical-surface text-tactical-text font-mono text-sm transition-colors"
        >
          Cancel
        </button>
      </SheetContent>
    </Sheet>
  );
};

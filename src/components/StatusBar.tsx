import { Decision } from '@/types/Decision';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface StatusBarProps {
  decisions: Decision[];
}
export const StatusBar = ({
  decisions
}: StatusBarProps) => {
  // Filter out archived decisions for all counts
  const activeDecisions = decisions.filter(d => !d.archived);
  const totalDecisions = activeDecisions.length;
  const stageStats = {
    backlog: activeDecisions.filter(d => d.stage === 'backlog').length,
    considering: activeDecisions.filter(d => d.stage === 'considering').length,
    committed: activeDecisions.filter(d => d.stage === 'committed').length,
    decided: activeDecisions.filter(d => d.stage === 'decided').length
  };

  // Active count excludes decided stage (no lessons column anymore)
  const activeWorkCount = stageStats.backlog + stageStats.considering + stageStats.committed;
  const highPriorityDecisions = activeDecisions.filter(d => d.priority === 'high').length;
  const avgConfidence = activeDecisions.length > 0 ? Math.round(activeDecisions.reduce((sum, d) => sum + d.confidence, 0) / activeDecisions.length) : 0;

  // Calculate accuracy score based on completed reflections
  const completedReflections = activeDecisions.filter(d => d.reflection?.thirtyDay?.completed && d.reflection.thirtyDay.wasCorrect !== undefined);
  const correctDecisions = completedReflections.filter(d => d.reflection?.thirtyDay?.wasCorrect === true);
  const accuracyScore = completedReflections.length > 0 ? Math.round(correctDecisions.length / completedReflections.length * 100) : 0;
  return <TooltipProvider>
      <div className="bg-tactical-surface/80 backdrop-blur-sm border-b border-tactical-border">
        
      </div>
    </TooltipProvider>;
};
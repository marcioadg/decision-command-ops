
import { Decision } from '@/types/Decision';

interface StatusBarProps {
  decisions: Decision[];
}

export const StatusBar = ({ decisions }: StatusBarProps) => {
  const totalDecisions = decisions.length;
  
  const stageStats = {
    backlog: decisions.filter(d => d.stage === 'backlog').length,
    considering: decisions.filter(d => d.stage === 'considering').length,
    committed: decisions.filter(d => d.stage === 'committed').length,
    decided: decisions.filter(d => d.stage === 'decided').length,
    lessons: decisions.filter(d => d.stage === 'lessons').length,
  };

  const highImpactDecisions = decisions.filter(d => d.impact === 'high').length;
  const avgConfidence = decisions.length > 0 
    ? Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length)
    : 0;

  const clarityScore = decisions.length > 0 
    ? Math.round(((stageStats.decided + stageStats.lessons) / totalDecisions) * 100)
    : 0;

  return (
    <div className="bg-tactical-surface/80 backdrop-blur-sm border-b border-tactical-border">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Pipeline Stats */}
          <div className="flex items-center space-x-6">
            <div className="hud-metric bg-tactical-accent/20 text-tactical-accent">
              ACTIVE: {totalDecisions}
            </div>
            
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="text-tactical-text/60">BACKLOG:</span>
              <span className="text-tactical-text">{stageStats.backlog}</span>
              
              <span className="text-tactical-text/60">CONSIDERING:</span>
              <span className="text-urgency-medium">{stageStats.considering}</span>
              
              <span className="text-tactical-text/60">COMMITTED:</span>
              <span className="text-tactical-accent">{stageStats.committed}</span>
              
              <span className="text-tactical-text/60">DECIDED:</span>
              <span className="text-impact-high">{stageStats.decided}</span>
            </div>
          </div>

          {/* Right Side - Performance Metrics */}
          <div className="flex items-center space-x-6">
            <div className="hud-metric">
              HIGH IMPACT: {highImpactDecisions}
            </div>
            
            <div className="hud-metric">
              AVG CONFIDENCE: {avgConfidence}%
            </div>
            
            <div className={`hud-metric ${clarityScore >= 70 ? 'bg-impact-high/20 text-impact-high' : clarityScore >= 40 ? 'bg-urgency-medium/20 text-urgency-medium' : 'bg-urgency-high/20 text-urgency-high'}`}>
              CLARITY: {clarityScore}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

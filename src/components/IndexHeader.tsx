
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { Plus, Archive, LogOut, BookOpen } from 'lucide-react';
import { Decision } from '@/types/Decision';
import { calculateDecisionMetrics } from '@/utils/metricsUtils';

interface IndexHeaderProps {
  profileName?: string;
  decisions: Decision[];
  showArchived: boolean;
  error?: string;
  onDecisionClick: (decision: Decision) => void;
  onQuickAddClick: () => void;
  onJournalClick: () => void;
  onToggleArchived: () => void;
  onLogout: () => void;
}

export const IndexHeader = ({
  profileName,
  decisions,
  showArchived,
  error,
  onDecisionClick,
  onQuickAddClick,
  onJournalClick,
  onToggleArchived,
  onLogout
}: IndexHeaderProps) => {
  const { avgConfidence, clarityScore } = calculateDecisionMetrics(decisions);

  return (
    <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-tactical-accent font-mono tracking-wider">
            DECISION COMMAND
          </h1>
          <div className="hud-metric">
            OPERATOR: {profileName || 'Unknown'}
          </div>
          
          <div className="hud-metric">
            CONFIDENCE: {avgConfidence}%
          </div>
          
          <div className={`hud-metric ${clarityScore >= 70 ? 'bg-impact-high/20 text-impact-high' : clarityScore >= 40 ? 'bg-urgency-medium/20 text-urgency-medium' : 'bg-urgency-high/20 text-urgency-high'}`}>
            CLARITY: {clarityScore}%
          </div>
          
          {error && (
            <div className="hud-metric bg-urgency-high/20 text-urgency-high">
              CONNECTION ISSUES
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationBell decisions={decisions} onDecisionClick={onDecisionClick} />
          
          <Button onClick={onJournalClick} className="bg-tactical-surface hover:bg-tactical-surface/80 text-tactical-accent border border-tactical-accent font-mono text-xs" size="sm" variant="outline">
            <BookOpen className="w-4 h-4 mr-1" />
            JOURNAL
          </Button>
          
          <Button onClick={onQuickAddClick} className="bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono text-xs" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            QUICK ADD
          </Button>
          
          <Button onClick={onToggleArchived} variant={showArchived ? "default" : "outline"} className="font-mono text-xs" size="sm">
            <Archive className="w-4 h-4 mr-1" />
            {showArchived ? 'HIDE ARCHIVED' : 'SHOW ARCHIVED'}
          </Button>

          <Button onClick={onLogout} variant="outline" className="font-mono text-xs border-tactical-border hover:bg-tactical-surface" size="sm">
            <LogOut className="w-4 h-4 mr-1" />
            LOGOUT
          </Button>
        </div>
      </div>
    </header>
  );
};

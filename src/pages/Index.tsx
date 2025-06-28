
import { useState, useEffect } from 'react';
import { DecisionPipeline } from '@/components/DecisionPipeline';
import { DecisionDetailModal } from '@/components/DecisionDetailModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { StatusBar } from '@/components/StatusBar';
import { Decision } from '@/types/Decision';
import { Button } from '@/components/ui/button';
import { Plus, Archive, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const savedDecisions = localStorage.getItem('tactical-decisions');
    if (savedDecisions) {
      const parsed = JSON.parse(savedDecisions).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        reflection: d.reflection ? {
          ...d.reflection,
          reminderDate: new Date(d.reflection.reminderDate)
        } : undefined
      }));
      setDecisions(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tactical-decisions', JSON.stringify(decisions));
  }, [decisions]);

  const handleDecisionUpdate = (updatedDecision: Decision) => {
    setDecisions(prev => 
      prev.map(d => d.id === updatedDecision.id ? updatedDecision : d)
    );
  };

  const handleDecisionClick = (decision: Decision) => {
    setSelectedDecision(decision);
    setIsDetailModalOpen(true);
  };

  const handleQuickAdd = (decision: Decision) => {
    setDecisions(prev => [...prev, decision]);
    soundSystem.playCardDrop();
  };

  const handleLogout = () => {
    signOut();
    toast({
      title: "SESSION TERMINATED",
      description: "You have been logged out",
    });
  };

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      {/* Header */}
      <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-tactical-accent font-mono tracking-wider">
              TACTICAL DECISION PIPELINE
            </h1>
            <div className="hud-metric">
              OPERATOR: {profile?.name || 'Unknown'}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsQuickAddOpen(true)}
              className="bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono text-xs"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              QUICK ADD
            </Button>
            
            <Button
              onClick={() => setShowArchived(!showArchived)}
              variant={showArchived ? "default" : "outline"}
              className="font-mono text-xs"
              size="sm"
            >
              <Archive className="w-4 h-4 mr-1" />
              {showArchived ? 'HIDE ARCHIVED' : 'SHOW ARCHIVED'}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="font-mono text-xs border-tactical-border hover:bg-tactical-surface"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-1" />
              LOGOUT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <DecisionPipeline
          decisions={decisions}
          onDecisionUpdate={handleDecisionUpdate}
          onDecisionClick={handleDecisionClick}
          showArchived={showArchived}
        />
      </main>

      {/* Status Bar */}
      <StatusBar decisions={decisions} />

      {/* Modals */}
      <DecisionDetailModal
        decision={selectedDecision}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDecision(null);
        }}
        onUpdate={handleDecisionUpdate}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAdd={handleQuickAdd}
      />
    </div>
  );
};

export default Index;

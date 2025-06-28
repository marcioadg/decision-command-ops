
import { useState, useEffect } from 'react';
import { DecisionPipeline } from '@/components/DecisionPipeline';
import { DecisionDetailModal } from '@/components/DecisionDetailModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { StatusBar } from '@/components/StatusBar';
import { Decision } from '@/types/Decision';
import { Button } from '@/components/ui/button';
import { Plus, Archive, LogOut, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDecisions } from '@/hooks/useDecisions';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const {
    decisions,
    loading,
    createDecision,
    updateDecision,
    deleteDecision,
    migrateFromLocalStorage
  } = useDecisions();

  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Check for localStorage data and offer migration on first load
  useEffect(() => {
    const checkForMigration = async () => {
      if (hasMigrated) return;
      
      const savedDecisions = localStorage.getItem('tactical-decisions');
      if (savedDecisions) {
        try {
          const localDecisions = JSON.parse(savedDecisions);
          if (localDecisions.length > 0) {
            const migratedCount = await migrateFromLocalStorage();
            if (migratedCount > 0) {
              setHasMigrated(true);
            }
          }
        } catch (error) {
          console.error('Error checking for migration:', error);
        }
      }
    };

    checkForMigration();
  }, [migrateFromLocalStorage, hasMigrated]);

  const handleDecisionUpdate = async (updatedDecision: Decision) => {
    try {
      await updateDecision(updatedDecision);
      soundSystem.playCardDrop();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleDecisionClick = (decision: Decision) => {
    setSelectedDecision(decision);
    setIsDetailModalOpen(true);
  };

  const handleQuickAdd = async (decision: Decision) => {
    try {
      await createDecision(decision);
      soundSystem.playCardDrop();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleArchive = async (decision: Decision) => {
    try {
      const updatedDecision: Decision = {
        ...decision,
        archived: !decision.archived,
        updatedAt: new Date()
      };
      await updateDecision(updatedDecision);
      soundSystem.playArchive();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleLogout = () => {
    signOut();
    toast({
      title: "SESSION TERMINATED",
      description: "You have been logged out",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tactical-accent mx-auto mb-4"></div>
          <p className="text-tactical-text font-mono">Loading tactical decisions...</p>
        </div>
      </div>
    );
  }

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
            <div className="hud-metric">
              <Database className="w-4 h-4 mr-1 inline" />
              DATABASE MODE
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
          onArchive={handleArchive}
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

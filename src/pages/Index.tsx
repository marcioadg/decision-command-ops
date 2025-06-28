
import { useState, useEffect } from 'react';
import { DecisionDetailModal } from '@/components/DecisionDetailModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { IndexHeader } from '@/components/IndexHeader';
import { IndexLoadingScreen } from '@/components/IndexLoadingScreen';
import { IndexErrorScreen } from '@/components/IndexErrorScreen';
import { IndexMainContent } from '@/components/IndexMainContent';
import { Decision } from '@/types/Decision';
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
    error,
    createDecision,
    updateDecision,
    migrateFromLocalStorage,
    refreshDecisions,
    retryCount
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

  const handleRetry = () => {
    console.log('Manual retry requested');
    refreshDecisions();
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
  };

  const handleQuickAddClick = () => {
    setIsQuickAddOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDecision(null);
  };

  const handleCloseQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  if (loading) {
    return <IndexLoadingScreen retryCount={retryCount} />;
  }

  // Show error screen with retry option
  if (error && !loading) {
    return (
      <IndexErrorScreen
        error={error}
        onRetry={handleRetry}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      <IndexHeader
        profileName={profile?.name}
        decisions={decisions}
        showArchived={showArchived}
        error={error}
        onDecisionClick={handleDecisionClick}
        onQuickAddClick={handleQuickAddClick}
        onToggleArchived={handleToggleArchived}
        onLogout={handleLogout}
      />

      <IndexMainContent
        decisions={decisions}
        showArchived={showArchived}
        onDecisionUpdate={handleDecisionUpdate}
        onDecisionClick={handleDecisionClick}
        onArchive={handleArchive}
      />

      {/* Modals */}
      <DecisionDetailModal
        decision={selectedDecision}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onUpdate={handleDecisionUpdate}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={handleCloseQuickAdd}
        onAdd={handleQuickAdd}
      />
    </div>
  );
};

export default Index;

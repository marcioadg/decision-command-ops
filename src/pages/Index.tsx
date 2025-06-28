import { useState, useEffect } from 'react';
import { DecisionPipeline } from '@/components/DecisionPipeline';
import { StatusBar } from '@/components/StatusBar';
import { QuickAddModal } from '@/components/QuickAddModal';
import { DecisionDetailModal } from '@/components/DecisionDetailModal';
import { Decision } from '@/types/Decision';
import { soundSystem } from '@/utils/soundSystem';
import { Archive, Volume2, VolumeX } from 'lucide-react';

const Index = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sample data for demo
  useEffect(() => {
    const sampleDecisions: Decision[] = [
      {
        id: '1',
        title: 'Hire VP of Engineering',
        category: 'People',
        impact: 'high',
        urgency: 'high',
        stage: 'considering',
        confidence: 4,
        owner: 'CEO',
        createdAt: new Date('2024-06-20'),
        notes: 'Need to scale engineering team for Q3 product launch. Looking for someone with experience in scaling from 10 to 50+ engineers.'
      },
      {
        id: '2',
        title: 'Series B Fundraising',
        category: 'Capital',
        impact: 'high',
        urgency: 'medium',
        stage: 'backlog',
        confidence: 3,
        owner: 'CEO',
        createdAt: new Date('2024-06-25'),
        notes: '18-month runway target, $50M round. Need to prepare pitch deck and financial projections.'
      },
      {
        id: '3',
        title: 'Enter European Market',
        category: 'Strategy',
        impact: 'medium',
        urgency: 'low',
        stage: 'committed',
        confidence: 5,
        owner: 'CEO',
        createdAt: new Date('2024-06-15'),
        notes: 'UK first, then Germany and France. Market research completed, regulatory approval needed.'
      }
    ];
    setDecisions(sampleDecisions);
  }, []);

  // Keyboard shortcut for quick add
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if (e.target === document.body || (e.target as HTMLElement).tagName === 'BODY') {
          e.preventDefault();
          setShowQuickAdd(true);
          soundSystem.playModalOpen();
        }
      }
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setSelectedDecision(null);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update sound system when setting changes
  useEffect(() => {
    soundSystem.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleDecisionUpdate = (updatedDecision: Decision) => {
    setDecisions(prev => 
      prev.map(d => d.id === updatedDecision.id ? updatedDecision : d)
    );
  };

  const handleDecisionAdd = (newDecision: Omit<Decision, 'id' | 'createdAt'>) => {
    const decision: Decision = {
      ...newDecision,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setDecisions(prev => [...prev, decision]);
    setShowQuickAdd(false);
  };

  const handleDecisionClick = (decision: Decision) => {
    setSelectedDecision(decision);
    soundSystem.playModalOpen();
  };

  const handleDecisionDetailUpdate = (updatedDecision: Decision) => {
    handleDecisionUpdate(updatedDecision);
    setSelectedDecision(updatedDecision);
  };

  const archivedCount = decisions.filter(d => d.archived).length;

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid flex flex-col">
      {/* Header */}
      <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-tactical-accent font-tactical">
                DECISION COMMAND
              </h1>
              <div className="hud-metric">
                TACTICAL PIPELINE v1.0
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Archive Toggle */}
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center space-x-2 px-3 py-2 rounded font-mono text-sm transition-colors ${
                  showArchived 
                    ? 'bg-tactical-accent text-tactical-bg' 
                    : 'bg-tactical-surface border border-tactical-border text-tactical-text hover:bg-tactical-border/50'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span>ARCHIVED ({archivedCount})</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-tactical-surface border border-tactical-border text-tactical-text px-3 py-2 rounded font-mono text-sm hover:bg-tactical-border/50 transition-colors"
                title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setShowQuickAdd(true);
                  soundSystem.playModalOpen();
                }}
                className="bg-tactical-accent text-tactical-bg px-4 py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors"
              >
                + NEW DECISION [D]
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <StatusBar decisions={decisions.filter(d => showArchived ? d.archived : !d.archived)} />

      {/* Main Pipeline */}
      <main className="container mx-auto px-6 py-6 flex-1 min-h-0">
        <DecisionPipeline 
          decisions={decisions} 
          onDecisionUpdate={handleDecisionUpdate}
          onDecisionClick={handleDecisionClick}
          showArchived={showArchived}
        />
      </main>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSubmit={handleDecisionAdd}
        />
      )}

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <DecisionDetailModal
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onUpdate={handleDecisionDetailUpdate}
        />
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-4 right-4 hud-metric">
        Press <span className="text-tactical-accent font-semibold">D</span> for quick add
      </div>
    </div>
  );
};

export default Index;

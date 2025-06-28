
import { useState, useEffect } from 'react';
import { DecisionPipeline } from '@/components/DecisionPipeline';
import { StatusBar } from '@/components/StatusBar';
import { QuickAddModal } from '@/components/QuickAddModal';
import { Decision } from '@/types/Decision';

const Index = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

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
        notes: 'Need to scale engineering team for Q3 product launch'
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
        notes: '18-month runway target, $50M round'
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
        notes: 'UK first, then Germany and France'
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
        }
      }
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      {/* Header */}
      <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm">
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
              <button
                onClick={() => setShowQuickAdd(true)}
                className="bg-tactical-accent text-tactical-bg px-4 py-2 rounded font-mono text-sm font-semibold hover:bg-tactical-accent/90 transition-colors"
              >
                + NEW DECISION [D]
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <StatusBar decisions={decisions} />

      {/* Main Pipeline */}
      <main className="container mx-auto px-6 py-6">
        <DecisionPipeline 
          decisions={decisions} 
          onDecisionUpdate={handleDecisionUpdate}
        />
      </main>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSubmit={handleDecisionAdd}
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

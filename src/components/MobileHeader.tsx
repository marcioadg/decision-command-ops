
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { Plus, Menu, X, Archive, BookOpen, LogOut } from 'lucide-react';
import { Decision } from '@/types/Decision';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileHeaderProps {
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

export const MobileHeader = ({
  profileName,
  decisions,
  showArchived,
  error,
  onDecisionClick,
  onQuickAddClick,
  onJournalClick,
  onToggleArchived,
  onLogout
}: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3">
        {/* Left: Title and Status */}
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-tactical-accent font-mono tracking-wider truncate">
            DECISION COMMAND
          </h1>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-tactical-text/60 font-mono truncate">
              {profileName || 'Unknown'}
            </span>
            {error && (
              <span className="text-urgency-high font-mono">
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <NotificationBell 
            decisions={decisions} 
            onDecisionClick={onDecisionClick} 
          />

          {/* Quick Add */}
          <Button
            onClick={onQuickAddClick}
            className="bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono text-xs px-3"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="font-mono text-xs border-tactical-border hover:bg-tactical-surface p-2"
                size="sm"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="bg-tactical-surface border-tactical-border w-80"
            >
              <SheetHeader>
                <SheetTitle className="text-tactical-accent font-mono text-left">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleMenuAction(onJournalClick)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-tactical-surface/50 hover:bg-tactical-surface border border-tactical-border transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-tactical-accent" />
                  <span className="font-mono text-sm text-tactical-text">
                    Journal
                  </span>
                </button>

                <button
                  onClick={() => handleMenuAction(onToggleArchived)}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors
                    ${showArchived 
                      ? 'bg-tactical-accent/20 border-tactical-accent text-tactical-accent' 
                      : 'bg-tactical-surface/50 hover:bg-tactical-surface border-tactical-border text-tactical-text'
                    }
                  `}
                >
                  <Archive className="w-5 h-5" />
                  <span className="font-mono text-sm">
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </span>
                </button>

                <div className="border-t border-tactical-border pt-3 mt-6">
                  <button
                    onClick={() => handleMenuAction(onLogout)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-urgency-high/10 hover:bg-urgency-high/20 border border-urgency-high/30 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-urgency-high" />
                    <span className="font-mono text-sm text-urgency-high">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

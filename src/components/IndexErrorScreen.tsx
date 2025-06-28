
import { Button } from '@/components/ui/button';

interface IndexErrorScreenProps {
  error: string;
  onRetry: () => void;
  onLogout: () => void;
}

export const IndexErrorScreen = ({ error, onRetry, onLogout }: IndexErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-urgency-high/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-urgency-high text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-bold text-tactical-text font-mono mb-2">
            CONNECTION ERROR
          </h2>
          <p className="text-tactical-text/80 font-mono text-sm mb-4">
            {error}
          </p>
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono"
            >
              RETRY CONNECTION
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="font-mono border-tactical-border hover:bg-tactical-surface"
            >
              LOGOUT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionStatus = ({ isConnected, onRetry, className = "" }: ConnectionStatusProps) => {
  const { toast } = useToast();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      toast({
        title: "Reconnecting",
        description: "Attempting to restore real-time connection..."
      });
    }
  };

  if (isConnected) {
    return (
      <div className={`flex items-center space-x-1 text-xs font-mono text-green-600 ${className}`}>
        <Wifi className="w-3 h-3" />
        <span>LIVE</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-xs font-mono text-red-600 ${className}`}>
      <div className="flex items-center space-x-1">
        <WifiOff className="w-3 h-3" />
        <span>OFFLINE</span>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          className="h-6 px-2 text-xs hover:bg-red-100"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          RETRY
        </Button>
      )}
    </div>
  );
};

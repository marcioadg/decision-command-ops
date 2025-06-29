
import { Wifi, WifiOff, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionStatus = ({ isConnected, onRetry, className = "" }: ConnectionStatusProps) => {
  const { toast } = useToast();
  const [isDisabled, setIsDisabled] = useState(false);

  const handleRetry = () => {
    if (onRetry && !isDisabled) {
      onRetry();
      toast({
        title: "Reconnecting",
        description: "Attempting to restore real-time connection..."
      });
    }
  };

  const handleEmergencyDisable = () => {
    setIsDisabled(true);
    toast({
      title: "Real-time Disabled",
      description: "Real-time updates have been disabled to prevent connection issues.",
      variant: "destructive"
    });
  };

  if (isDisabled) {
    return (
      <div className={`flex items-center space-x-1 text-xs font-mono text-orange-600 ${className}`}>
        <XCircle className="w-3 h-3" />
        <span>DISABLED</span>
      </div>
    );
  }

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
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="h-6 px-2 text-xs hover:bg-red-100"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            RETRY
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmergencyDisable}
            className="h-6 px-2 text-xs hover:bg-orange-100 text-orange-600"
          >
            <XCircle className="w-3 h-3 mr-1" />
            DISABLE
          </Button>
        </>
      )}
    </div>
  );
};

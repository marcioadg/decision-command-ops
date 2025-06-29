
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusMonitorProps {
  isRealTimeConnected: boolean;
  className?: string;
}

export const ConnectionStatusMonitor = ({ 
  isRealTimeConnected, 
  className = "" 
}: ConnectionStatusMonitorProps) => {
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (isRealTimeConnected) {
      setConnectionQuality('good');
      setLastUpdate(new Date());
      
      // Monitor connection quality
      const qualityCheck = setInterval(() => {
        const now = new Date();
        const timeSinceUpdate = lastUpdate ? now.getTime() - lastUpdate.getTime() : 0;
        
        if (timeSinceUpdate > 60000) { // More than 1 minute since last update
          setConnectionQuality('poor');
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(qualityCheck);
    } else {
      setConnectionQuality('offline');
      setLastUpdate(null);
    }
  }, [isRealTimeConnected, lastUpdate]);

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'good': return 'text-green-600';
      case 'poor': return 'text-yellow-600'; 
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionQuality) {
      case 'good': return <Wifi className="w-3 h-3" />;
      case 'poor': return <AlertTriangle className="w-3 h-3" />;
      case 'offline': return <WifiOff className="w-3 h-3" />;
      default: return <WifiOff className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    switch (connectionQuality) {
      case 'good': return 'LIVE';
      case 'poor': return 'SLOW';
      case 'offline': return 'OFFLINE';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className={`flex items-center space-x-1 text-xs font-mono ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {lastUpdate && connectionQuality === 'good' && (
        <span className="text-xs opacity-60">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

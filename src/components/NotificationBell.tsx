
import { useState } from 'react';
import { Bell, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Decision } from '@/types/Decision';
import { notificationService, ReflectionNotification } from '@/services/notificationService';

interface NotificationBellProps {
  decisions: Decision[];
  onDecisionClick: (decision: Decision) => void;
}

export const NotificationBell = ({ decisions, onDecisionClick }: NotificationBellProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const notifications = notificationService.getReflectionNotifications(decisions);
  const counts = notificationService.getNotificationCounts(decisions);
  
  const getNotificationIcon = (notification: ReflectionNotification) => {
    const baseClasses = "w-3 h-3";
    switch (notification.status) {
      case 'overdue':
        return <AlertTriangle className={`${baseClasses} text-red-400`} />;
      case 'due-today':
        return <Clock className={`${baseClasses} text-yellow-400`} />;
      case 'due-soon':
        return <Calendar className={`${baseClasses} text-blue-400`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-400';
      case 'due-today': return 'text-yellow-400';
      case 'due-soon': return 'text-blue-400';
      default: return 'text-tactical-text/60';
    }
  };

  const handleNotificationClick = (notification: ReflectionNotification) => {
    const decision = decisions.find(d => d.id === notification.decisionId);
    if (decision) {
      onDecisionClick(decision);
      setShowDropdown(false);
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-tactical-text/60 hover:text-tactical-text transition-colors"
      >
        <Bell className="w-5 h-5" />
        {counts.total > 0 && (
          <span className="absolute -top-1 -right-1 bg-tactical-accent text-tactical-bg text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono">
            {counts.total > 9 ? '9+' : counts.total}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-tactical-surface border border-tactical-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-tactical-border">
            <h3 className="font-mono text-sm font-semibold text-tactical-accent uppercase">
              Reflection Notifications
            </h3>
            {counts.total > 0 && (
              <p className="text-xs text-tactical-text/60 mt-1">
                {counts.overdue > 0 && `${counts.overdue} overdue`}
                {counts.overdue > 0 && counts.dueToday > 0 && ', '}
                {counts.dueToday > 0 && `${counts.dueToday} due today`}
                {(counts.overdue > 0 || counts.dueToday > 0) && counts.dueThisWeek > 0 && ', '}
                {counts.dueThisWeek > 0 && `${counts.dueThisWeek} due soon`}
              </p>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-tactical-text/60">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reflections due</p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full p-3 text-left hover:bg-tactical-bg/50 transition-colors border-b border-tactical-border/50 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-tactical-text truncate">
                        {notification.decisionTitle}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-mono text-tactical-text/60">
                          {notification.type.toUpperCase()} REFLECTION
                        </span>
                        <span className={`text-xs font-mono ${getStatusColor(notification.status)}`}>
                          {formatDueDate(notification.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-tactical-border bg-tactical-bg/30">
              <p className="text-xs text-tactical-text/60 text-center">
                Click any notification to open the decision details
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

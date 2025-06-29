
import { Decision } from '@/types/Decision';

export interface ReflectionNotification {
  id: string;
  decisionId: string;
  decisionTitle: string;
  type: '7-day' | '30-day' | '90-day';
  dueDate: Date;
  status: 'overdue' | 'due-today';
}

export const notificationService = {
  getReflectionNotifications(decisions: Decision[]): ReflectionNotification[] {
    const notifications: ReflectionNotification[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    decisions.forEach(decision => {
      if (!decision.reflection) return;

      const checkInterval = (interval: any, type: '7-day' | '30-day' | '90-day') => {
        if (!interval || interval.completed) return;
        
        const dueDate = new Date(interval.date.getFullYear(), interval.date.getMonth(), interval.date.getDate());
        let status: 'overdue' | 'due-today' | null = null;
        
        if (dueDate < today) {
          status = 'overdue';
        } else if (dueDate.getTime() === today.getTime()) {
          status = 'due-today';
        }

        // Only add notifications that are overdue or due today
        if (status) {
          notifications.push({
            id: `${decision.id}-${type}`,
            decisionId: decision.id,
            decisionTitle: decision.title,
            type,
            dueDate: interval.date,
            status
          });
        }
      };

      checkInterval(decision.reflection.sevenDay, '7-day');
      checkInterval(decision.reflection.thirtyDay, '30-day');
      checkInterval(decision.reflection.ninetyDay, '90-day');
    });

    // Sort by urgency: overdue first, then due today
    return notifications.sort((a, b) => {
      const urgencyOrder = { 'overdue': 0, 'due-today': 1 };
      const urgencyDiff = urgencyOrder[a.status] - urgencyOrder[b.status];
      if (urgencyDiff !== 0) return urgencyDiff;
      
      // Then by due date
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  },

  getNotificationCounts(decisions: Decision[]): {
    overdue: number;
    dueToday: number;
    total: number;
  } {
    const notifications = this.getReflectionNotifications(decisions);
    
    const counts = {
      overdue: notifications.filter(n => n.status === 'overdue').length,
      dueToday: notifications.filter(n => n.status === 'due-today').length,
      total: notifications.length
    };

    return counts;
  }
};

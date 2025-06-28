
import { Decision } from '@/types/Decision';

export const reflectionService = {
  // Get decisions that need reflection
  async getReflectionsDue(decisions: Decision[]): Promise<{
    overdue: Decision[];
    dueToday: Decision[];
    dueThisWeek: Decision[];
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const overdue: Decision[] = [];
      const dueToday: Decision[] = [];
      const dueThisWeek: Decision[] = [];

      decisions.forEach(decision => {
        if (!decision.reflection) return;

        const checkReflection = (interval: any, type: string) => {
          if (!interval || interval.completed) return;
          
          const dueDate = new Date(interval.date.getFullYear(), interval.date.getMonth(), interval.date.getDate());
          
          if (dueDate < today) {
            overdue.push(decision);
          } else if (dueDate.getTime() === today.getTime()) {
            dueToday.push(decision);
          } else if (dueDate < nextWeek) {
            dueThisWeek.push(decision);
          }
        };

        checkReflection(decision.reflection.sevenDay, '7-day');
        checkReflection(decision.reflection.thirtyDay, '30-day');
        checkReflection(decision.reflection.ninetyDay, '90-day');
      });

      return { overdue, dueToday, dueThisWeek };
    } catch (error) {
      console.error('Error getting reflections due:', error);
      return { overdue: [], dueToday: [], dueThisWeek: [] };
    }
  }
};

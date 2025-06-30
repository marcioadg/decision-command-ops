
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
        if (!decision.reflection?.thirtyDay || decision.reflection.thirtyDay.completed) return;

        const dueDate = new Date(decision.reflection.thirtyDay.date.getFullYear(), decision.reflection.thirtyDay.date.getMonth(), decision.reflection.thirtyDay.date.getDate());
        
        if (dueDate < today) {
          overdue.push(decision);
        } else if (dueDate.getTime() === today.getTime()) {
          dueToday.push(decision);
        } else if (dueDate < nextWeek) {
          dueThisWeek.push(decision);
        }
      });

      return { overdue, dueToday, dueThisWeek };
    } catch (error) {
      console.error('Error getting reflections due:', error);
      return { overdue: [], dueToday: [], dueThisWeek: [] };
    }
  }
};

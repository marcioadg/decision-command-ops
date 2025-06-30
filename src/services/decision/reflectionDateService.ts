
import { Decision } from '@/types/Decision';

// Auto-calculate reflection date when decision moves to 'decided' stage
export const calculateReflectionDate = (createdAt: Date) => {
  const thirtyDayDate = new Date(createdAt);
  thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
  return thirtyDayDate;
};

// Setup reflection interval for a decision
export const setupReflectionIntervals = (decision: Decision | Omit<Decision, 'id' | 'createdAt'>, createdAt: Date): any => {
  if (decision.stage === 'decided' && !decision.reflection?.thirtyDay) {
    const thirtyDayDate = calculateReflectionDate(createdAt);
    return {
      ...decision.reflection,
      thirtyDay: { date: thirtyDayDate, completed: false, wasCorrect: undefined },
      questions: decision.reflection?.questions || [
        'What went well with this decision?',
        'What could have been improved?',
        'What would I do differently next time?',
        'Was this decision correct?'
      ]
    };
  }
  return decision.reflection;
};

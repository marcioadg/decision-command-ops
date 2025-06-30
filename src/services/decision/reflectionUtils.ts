
import { Decision } from '@/types/Decision';

// Auto-calculate reflection date when decision moves to 'decided' stage
export const calculateReflectionDate = (createdAt: Date) => {
  const thirtyDayDate = new Date(createdAt);
  thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
  return thirtyDayDate;
};

export const setupReflectionIntervals = (decision: Decision, createdAt: Date = new Date()) => {
  if (decision.stage === 'decided' && !decision.reflection?.thirtyDay) {
    const thirtyDayDate = calculateReflectionDate(createdAt);
    return {
      ...decision.reflection,
      thirtyDay: { date: thirtyDayDate, completed: false, wasCorrect: undefined },
      questions: decision.reflection?.questions || [
        'What went well with this decision?',
        'What could have been improved?',
        'What would I do differently next time?'
      ]
    };
  }
  return decision.reflection;
};

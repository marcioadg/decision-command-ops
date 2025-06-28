
import { Decision } from '@/types/Decision';

// Auto-calculate reflection dates when decision moves to 'decided' stage
export const calculateReflectionDates = (createdAt: Date) => {
  const sevenDayDate = new Date(createdAt);
  sevenDayDate.setDate(sevenDayDate.getDate() + 7);
  
  const thirtyDayDate = new Date(createdAt);
  thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
  
  const ninetyDayDate = new Date(createdAt);
  ninetyDayDate.setDate(ninetyDayDate.getDate() + 90);
  
  return { sevenDayDate, thirtyDayDate, ninetyDayDate };
};

export const setupReflectionIntervals = (decision: Decision, createdAt: Date = new Date()) => {
  if (decision.stage === 'decided' && !decision.reflection?.sevenDay) {
    const { sevenDayDate, thirtyDayDate, ninetyDayDate } = calculateReflectionDates(createdAt);
    return {
      ...decision.reflection,
      sevenDay: { date: sevenDayDate, completed: false },
      thirtyDay: { date: thirtyDayDate, completed: false },
      ninetyDay: { date: ninetyDayDate, completed: false },
      questions: decision.reflection?.questions || [
        'What went well with this decision?',
        'What could have been improved?',
        'What would I do differently next time?'
      ]
    };
  }
  return decision.reflection;
};

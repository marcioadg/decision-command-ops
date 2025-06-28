
import { Decision } from '@/types/Decision';

// Deep clone a Decision object while preserving Date objects
export const deepCloneDecision = (decision: Decision): Decision => {
  const cloned: Decision = {
    ...decision,
    createdAt: new Date(decision.createdAt),
    updatedAt: decision.updatedAt ? new Date(decision.updatedAt) : undefined,
  };

  // Handle preAnalysis
  if (decision.preAnalysis) {
    cloned.preAnalysis = { ...decision.preAnalysis };
  }

  // Handle reflection with proper Date cloning
  if (decision.reflection) {
    cloned.reflection = {
      questions: decision.reflection.questions ? [...decision.reflection.questions] : undefined,
      sevenDay: decision.reflection.sevenDay ? {
        ...decision.reflection.sevenDay,
        date: new Date(decision.reflection.sevenDay.date),
        answers: decision.reflection.sevenDay.answers ? [...decision.reflection.sevenDay.answers] : undefined
      } : undefined,
      thirtyDay: decision.reflection.thirtyDay ? {
        ...decision.reflection.thirtyDay,
        date: new Date(decision.reflection.thirtyDay.date),
        answers: decision.reflection.thirtyDay.answers ? [...decision.reflection.thirtyDay.answers] : undefined
      } : undefined,
      ninetyDay: decision.reflection.ninetyDay ? {
        ...decision.reflection.ninetyDay,
        date: new Date(decision.reflection.ninetyDay.date),
        answers: decision.reflection.ninetyDay.answers ? [...decision.reflection.ninetyDay.answers] : undefined
      } : undefined
    };
  }

  return cloned;
};

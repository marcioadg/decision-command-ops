
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
      thirtyDay: decision.reflection.thirtyDay ? {
        ...decision.reflection.thirtyDay,
        date: new Date(decision.reflection.thirtyDay.date),
        answers: decision.reflection.thirtyDay.answers ? [...decision.reflection.thirtyDay.answers] : undefined
      } : undefined
    };
  }

  return cloned;
};

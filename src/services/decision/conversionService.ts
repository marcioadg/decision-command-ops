
import { Decision, DecisionCategory, DecisionPriority, DecisionStage } from '@/types/Decision';

// Convert database decision to frontend Decision type
export const convertToDecision = (dbDecision: any): Decision => ({
  id: dbDecision.id,
  title: dbDecision.title,
  category: dbDecision.category as DecisionCategory,
  priority: dbDecision.priority as DecisionPriority,
  stage: dbDecision.stage as DecisionStage,
  confidence: dbDecision.confidence,
  owner: dbDecision.owner,
  notes: dbDecision.notes,
  biasCheck: dbDecision.bias_check,
  archived: dbDecision.archived || false,
  createdAt: new Date(dbDecision.created_at),
  updatedAt: dbDecision.updated_at ? new Date(dbDecision.updated_at) : undefined,
  reflection: (dbDecision.reflection_7_day_date || dbDecision.reflection_30_day_date || dbDecision.reflection_90_day_date || dbDecision.reflection_questions) ? {
    sevenDay: dbDecision.reflection_7_day_date ? {
      date: new Date(dbDecision.reflection_7_day_date),
      completed: dbDecision.reflection_7_day_completed || false,
      answers: dbDecision.reflection_7_day_answers || []
    } : undefined,
    thirtyDay: dbDecision.reflection_30_day_date ? {
      date: new Date(dbDecision.reflection_30_day_date),
      completed: dbDecision.reflection_30_day_completed || false,
      answers: dbDecision.reflection_30_day_answers || []
    } : undefined,
    ninetyDay: dbDecision.reflection_90_day_date ? {
      date: new Date(dbDecision.reflection_90_day_date),
      completed: dbDecision.reflection_90_day_completed || false,
      answers: dbDecision.reflection_90_day_answers || []
    } : undefined,
    questions: dbDecision.reflection_questions || []
  } : undefined
});

// Convert frontend Decision to database format
export const convertToDbDecision = (decision: Decision): any => {
  const dbDecision: any = {
    title: decision.title,
    category: decision.category,
    priority: decision.priority,
    stage: decision.stage,
    confidence: decision.confidence,
    owner: decision.owner,
    notes: decision.notes,
    bias_check: decision.biasCheck,
    archived: decision.archived || false,
    reflection_questions: decision.reflection?.questions
  };

  // Add reflection interval data
  if (decision.reflection?.sevenDay) {
    dbDecision.reflection_7_day_date = decision.reflection.sevenDay.date.toISOString();
    dbDecision.reflection_7_day_completed = decision.reflection.sevenDay.completed;
    dbDecision.reflection_7_day_answers = decision.reflection.sevenDay.answers;
  }
  if (decision.reflection?.thirtyDay) {
    dbDecision.reflection_30_day_date = decision.reflection.thirtyDay.date.toISOString();
    dbDecision.reflection_30_day_completed = decision.reflection.thirtyDay.completed;
    dbDecision.reflection_30_day_answers = decision.reflection.thirtyDay.answers;
  }
  if (decision.reflection?.ninetyDay) {
    dbDecision.reflection_90_day_date = decision.reflection.ninetyDay.date.toISOString();
    dbDecision.reflection_90_day_completed = decision.reflection.ninetyDay.completed;
    dbDecision.reflection_90_day_answers = decision.reflection.ninetyDay.answers;
  }

  return dbDecision;
};

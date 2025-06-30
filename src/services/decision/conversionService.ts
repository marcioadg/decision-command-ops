
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
  preAnalysis: dbDecision.pre_analysis ? {
    upside: dbDecision.pre_analysis.upside,
    downside: dbDecision.pre_analysis.downside,
    alignment: dbDecision.pre_analysis.alignment
  } : undefined,
  reflection: (dbDecision.reflection_30_day_date || dbDecision.reflection_questions) ? {
    thirtyDay: dbDecision.reflection_30_day_date ? {
      date: new Date(dbDecision.reflection_30_day_date),
      completed: dbDecision.reflection_30_day_completed || false,
      answers: dbDecision.reflection_30_day_answers || [],
      wasCorrect: dbDecision.reflection_was_correct
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
    pre_analysis: decision.preAnalysis ? {
      upside: decision.preAnalysis.upside,
      downside: decision.preAnalysis.downside,
      alignment: decision.preAnalysis.alignment
    } : null,
    reflection_questions: decision.reflection?.questions
  };

  // Add 30-day reflection data
  if (decision.reflection?.thirtyDay) {
    dbDecision.reflection_30_day_date = decision.reflection.thirtyDay.date.toISOString();
    dbDecision.reflection_30_day_completed = decision.reflection.thirtyDay.completed;
    dbDecision.reflection_30_day_answers = decision.reflection.thirtyDay.answers;
    dbDecision.reflection_was_correct = decision.reflection.thirtyDay.wasCorrect;
  }

  return dbDecision;
};


import { Decision } from '@/types/Decision';

export const convertDatabaseRecordToDecision = (record: any): Decision => {
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    priority: record.priority === 'high' ? 'high' : record.priority === 'medium' ? 'medium' : 'low',
    stage: record.stage,
    confidence: record.confidence,
    owner: record.owner || '',
    createdAt: new Date(record.created_at),
    updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
    notes: record.notes || undefined,
    biasCheck: record.bias_check || undefined,
    archived: record.archived || false,
    preAnalysis: record.pre_analysis ? {
      upside: record.pre_analysis.upside,
      downside: record.pre_analysis.downside,
      alignment: record.pre_analysis.alignment
    } : undefined,
    reflection: record.reflection_30_day_date || record.reflection_questions ? {
      thirtyDay: record.reflection_30_day_date ? {
        date: new Date(record.reflection_30_day_date),
        completed: record.reflection_30_day_completed || false,
        answers: record.reflection_30_day_answers || undefined,
        wasCorrect: record.reflection_was_correct
      } : undefined,
      questions: record.reflection_questions || undefined
    } : undefined
  };
};

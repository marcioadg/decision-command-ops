
import { supabase } from '@/integrations/supabase/client';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency, DecisionStage } from '@/types/Decision';

// Convert database decision to frontend Decision type
const convertToDecision = (dbDecision: any): Decision => ({
  id: dbDecision.id,
  title: dbDecision.title,
  category: dbDecision.category as DecisionCategory,
  impact: dbDecision.impact as DecisionImpact,
  urgency: dbDecision.urgency as DecisionUrgency,
  stage: dbDecision.stage as DecisionStage,
  confidence: dbDecision.confidence,
  owner: dbDecision.owner,
  notes: dbDecision.notes,
  biasCheck: dbDecision.bias_check,
  archived: dbDecision.archived || false,
  createdAt: new Date(dbDecision.created_at),
  updatedAt: dbDecision.updated_at ? new Date(dbDecision.updated_at) : undefined,
  reflection: dbDecision.reflection_reminder_date ? {
    reminderDate: new Date(dbDecision.reflection_reminder_date),
    questions: dbDecision.reflection_questions || [],
    answers: dbDecision.reflection_answers || []
  } : undefined
});

// Convert frontend Decision to database format
const convertToDbDecision = (decision: Decision): any => ({
  title: decision.title,
  category: decision.category,
  impact: decision.impact,
  urgency: decision.urgency,
  stage: decision.stage,
  confidence: decision.confidence,
  owner: decision.owner,
  notes: decision.notes,
  bias_check: decision.biasCheck,
  archived: decision.archived || false,
  reflection_reminder_date: decision.reflection?.reminderDate.toISOString(),
  reflection_questions: decision.reflection?.questions,
  reflection_answers: decision.reflection?.answers
});

export const decisionService = {
  // Get all decisions for current user
  async getDecisions(): Promise<Decision[]> {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching decisions:', error);
      throw error;
    }

    return data.map(convertToDecision);
  },

  // Create new decision
  async createDecision(decision: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dbDecision = {
      ...convertToDbDecision({ ...decision, id: '', createdAt: new Date() }),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('decisions')
      .insert(dbDecision)
      .select()
      .single();

    if (error) {
      console.error('Error creating decision:', error);
      throw error;
    }

    return convertToDecision(data);
  },

  // Update existing decision
  async updateDecision(decision: Decision): Promise<Decision> {
    const dbDecision = convertToDbDecision(decision);

    const { data, error } = await supabase
      .from('decisions')
      .update(dbDecision)
      .eq('id', decision.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating decision:', error);
      throw error;
    }

    return convertToDecision(data);
  },

  // Delete decision
  async deleteDecision(id: string): Promise<void> {
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting decision:', error);
      throw error;
    }
  },

  // Migrate localStorage decisions to database
  async migrateLocalStorageDecisions(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const savedDecisions = localStorage.getItem('tactical-decisions');
    if (!savedDecisions) return 0;

    try {
      const localDecisions: Decision[] = JSON.parse(savedDecisions).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        reflection: d.reflection ? {
          ...d.reflection,
          reminderDate: new Date(d.reflection.reminderDate)
        } : undefined
      }));

      const dbDecisions = localDecisions.map(decision => ({
        ...convertToDbDecision(decision),
        user_id: user.id
      }));

      const { error } = await supabase
        .from('decisions')
        .insert(dbDecisions);

      if (error) {
        console.error('Error migrating decisions:', error);
        throw error;
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('tactical-decisions');
      return localDecisions.length;
    } catch (error) {
      console.error('Error parsing localStorage decisions:', error);
      return 0;
    }
  }
};

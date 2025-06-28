import { supabase } from '@/integrations/supabase/client';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency, DecisionStage } from '@/types/Decision';

// Network utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for database operation`);
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  throw new Error('Max retries exceeded');
};

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
    try {
      console.log('Starting to fetch decisions...');
      
      const result = await retryRequest(async () => {
        const { data, error } = await supabase
          .from('decisions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching decisions:', error);
          throw error;
        }

        return data;
      });

      console.log(`Successfully fetched ${result?.length || 0} decisions`);
      return result?.map(convertToDecision) || [];
    } catch (error) {
      console.error('Error in getDecisions:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Create new decision
  async createDecision(decision: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    try {
      console.log('Creating new decision:', decision.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbDecision = {
        ...convertToDbDecision({ ...decision, id: '', createdAt: new Date() }),
        user_id: user.id
      };

      const result = await retryRequest(async () => {
        const { data, error } = await supabase
          .from('decisions')
          .insert(dbDecision)
          .select()
          .single();

        if (error) {
          console.error('Supabase error creating decision:', error);
          throw error;
        }

        return data;
      });

      console.log('Successfully created decision:', result.id);
      return convertToDecision(result);
    } catch (error) {
      console.error('Error in createDecision:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Update existing decision
  async updateDecision(decision: Decision): Promise<Decision> {
    try {
      console.log('Updating decision:', decision.id);
      
      const dbDecision = convertToDbDecision(decision);

      const result = await retryRequest(async () => {
        const { data, error } = await supabase
          .from('decisions')
          .update(dbDecision)
          .eq('id', decision.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error updating decision:', error);
          throw error;
        }

        return data;
      });

      console.log('Successfully updated decision:', result.id);
      return convertToDecision(result);
    } catch (error) {
      console.error('Error in updateDecision:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Delete decision
  async deleteDecision(id: string): Promise<void> {
    try {
      console.log('Deleting decision:', id);
      
      await retryRequest(async () => {
        const { error } = await supabase
          .from('decisions')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase error deleting decision:', error);
          throw error;
        }
      });

      console.log('Successfully deleted decision:', id);
    } catch (error) {
      console.error('Error in deleteDecision:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Migrate localStorage decisions to database
  async migrateLocalStorageDecisions(): Promise<number> {
    try {
      console.log('Starting localStorage migration...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const savedDecisions = localStorage.getItem('tactical-decisions');
      if (!savedDecisions) {
        console.log('No localStorage decisions found');
        return 0;
      }

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

      await retryRequest(async () => {
        const { error } = await supabase
          .from('decisions')
          .insert(dbDecisions);

        if (error) {
          console.error('Supabase error migrating decisions:', error);
          throw error;
        }
      });

      // Clear localStorage after successful migration
      localStorage.removeItem('tactical-decisions');
      console.log(`Successfully migrated ${localDecisions.length} decisions`);
      return localDecisions.length;
    } catch (error) {
      console.error('Error in migrateLocalStorageDecisions:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      return 0;
    }
  }
};

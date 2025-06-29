
import { supabase } from '@/integrations/supabase/client';
import { Decision, DecisionCategory, DecisionPriority, DecisionStage } from '@/types/Decision';
import { migrationService } from './decision/migrationService';

// Network utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for secure database operation`);
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
const convertToDbDecision = (decision: Decision): any => {
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

// Auto-calculate reflection dates when decision moves to 'decided' stage
const calculateReflectionDates = (createdAt: Date) => {
  const sevenDayDate = new Date(createdAt);
  sevenDayDate.setDate(sevenDayDate.getDate() + 7);
  
  const thirtyDayDate = new Date(createdAt);
  thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
  
  const ninetyDayDate = new Date(createdAt);
  ninetyDayDate.setDate(ninetyDayDate.getDate() + 90);
  
  return { sevenDayDate, thirtyDayDate, ninetyDayDate };
};

export const secureDecisionService = {
  // Get all decisions - supports both personal and company-based decisions
  async getDecisions(): Promise<Decision[]> {
    try {
      console.log('Starting to fetch decisions...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Try to get user's profile to find company_id (gracefully handle if no company)
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const result = await retryRequest(async () => {
        let query = supabase
          .from('decisions')
          .select('*')
          .order('created_at', { ascending: false });

        // If user has a company, get company decisions
        // If no company, get personal decisions (where user_id matches and company_id is null)
        if (profile?.company_id) {
          query = query.eq('company_id', profile.company_id);
        } else {
          query = query.eq('user_id', user.id).is('company_id', null);
        }

        const { data, error } = await query;

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
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Create new decision - supports both personal and company-based decisions
  async createDecision(decision: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    try {
      console.log('Creating new decision:', decision.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's profile to find company_id (if any)
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const now = new Date();
      const newDecision = { ...decision, id: '', createdAt: now };
      
      // Auto-set reflection dates if moving to 'decided' stage
      if (decision.stage === 'decided' && !decision.reflection?.sevenDay) {
        const { sevenDayDate, thirtyDayDate, ninetyDayDate } = calculateReflectionDates(now);
        newDecision.reflection = {
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

      const dbDecision = {
        ...convertToDbDecision(newDecision),
        user_id: user.id,
        company_id: profile?.company_id || null // Allow null for personal decisions
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
      
      // Auto-set reflection dates if moving to 'decided' stage for the first time
      if (decision.stage === 'decided' && !decision.reflection?.sevenDay) {
        const { sevenDayDate, thirtyDayDate, ninetyDayDate } = calculateReflectionDates(decision.createdAt);
        decision.reflection = {
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

  // Migrate localStorage decisions - updated to handle both personal and company contexts
  async migrateLocalStorageDecisions(): Promise<number> {
    try {
      console.log('Starting localStorage migration with flexible company support...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const savedDecisions = localStorage.getItem('tactical-decisions');
      if (!savedDecisions) {
        console.log('No localStorage decisions found');
        return 0;
      }

      // Get user's profile to determine company context
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const localDecisions: Decision[] = JSON.parse(savedDecisions).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
        // Convert old reflection structure to new one
        reflection: d.reflection ? {
          questions: d.reflection.questions || [],
          sevenDay: d.reflection.reminderDate ? {
            date: new Date(d.reflection.reminderDate),
            completed: d.reflection.answers?.length > 0,
            answers: d.reflection.answers || []
          } : undefined
        } : undefined
      }));

      const dbDecisions = localDecisions.map(decision => ({
        ...convertToDbDecision(decision),
        user_id: user.id,
        company_id: profile?.company_id || null // Support both company and personal decisions
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
      
      throw error;
    }
  },

  // Get decisions that need reflection
  async getReflectionsDue(): Promise<{
    overdue: Decision[];
    dueToday: Decision[];
    dueThisWeek: Decision[];
  }> {
    try {
      const decisions = await this.getDecisions();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const overdue: Decision[] = [];
      const dueToday: Decision[] = [];
      const dueThisWeek: Decision[] = [];

      decisions.forEach(decision => {
        if (!decision.reflection) return;

        const checkReflection = (interval: any, type: string) => {
          if (!interval || interval.completed) return;
          
          const dueDate = new Date(interval.date.getFullYear(), interval.date.getMonth(), interval.date.getDate());
          
          if (dueDate < today) {
            overdue.push(decision);
          } else if (dueDate.getTime() === today.getTime()) {
            dueToday.push(decision);
          } else if (dueDate < nextWeek) {
            dueThisWeek.push(decision);
          }
        };

        checkReflection(decision.reflection.sevenDay, '7-day');
        checkReflection(decision.reflection.thirtyDay, '30-day');
        checkReflection(decision.reflection.ninetyDay, '90-day');
      });

      return { overdue, dueToday, dueThisWeek };
    } catch (error) {
      console.error('Error getting reflections due:', error);
      return { overdue: [], dueToday: [], dueThisWeek: [] };
    }
  }
};

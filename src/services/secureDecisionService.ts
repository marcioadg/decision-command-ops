import { supabase } from '@/integrations/supabase/client';
import { Decision, DecisionCategory, DecisionImpact, DecisionUrgency, DecisionStage } from '@/types/Decision';
import { auditService } from './auditService';

// Enhanced decision service with security logging
export const secureDecisionService = {
  async getDecisions(): Promise<Decision[]> {
    try {
      console.log('Starting to fetch decisions with security checks...');
      
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching decisions:', error);
        await auditService.logEvent('fetch_decisions_failed', 'decision', undefined, { error: error.message });
        throw error;
      }

      await auditService.logEvent('fetch_decisions_success', 'decision', undefined, { count: data?.length || 0 });
      
      return data?.map(this.convertToDecision) || [];
    } catch (error) {
      console.error('Error in getDecisions:', error);
      throw error;
    }
  },

  async createDecision(decision: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    try {
      console.log('Creating new decision with security logging:', decision.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await auditService.logEvent('create_decision_unauthorized', 'decision', undefined, { title: decision.title });
        throw new Error('User not authenticated');
      }

      // Get user's company for multi-tenant security
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const now = new Date();
      const newDecision = { ...decision, id: '', createdAt: now };
      
      // Auto-set reflection dates if moving to 'decided' stage
      if (decision.stage === 'decided' && !decision.reflection?.sevenDay) {
        const { sevenDayDate, thirtyDayDate, ninetyDayDate } = this.calculateReflectionDates(now);
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
        ...this.convertToDbDecision(newDecision),
        user_id: user.id,
        company_id: profile?.company_id
      };

      const { data, error } = await supabase
        .from('decisions')
        .insert(dbDecision)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating decision:', error);
        await auditService.logEvent('create_decision_failed', 'decision', undefined, { 
          title: decision.title, 
          error: error.message 
        });
        throw error;
      }

      await auditService.logEvent('create_decision_success', 'decision', data.id, { 
        title: decision.title,
        category: decision.category,
        stage: decision.stage
      });

      console.log('Successfully created decision:', data.id);
      return this.convertToDecision(data);
    } catch (error) {
      console.error('Error in createDecision:', error);
      throw error;
    }
  },

  async updateDecision(decision: Decision): Promise<Decision> {
    try {
      console.log('Updating decision with security logging:', decision.id);
      
      // Auto-set reflection dates if moving to 'decided' stage for the first time
      if (decision.stage === 'decided' && !decision.reflection?.sevenDay) {
        const { sevenDayDate, thirtyDayDate, ninetyDayDate } = this.calculateReflectionDates(decision.createdAt);
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
      
      const dbDecision = this.convertToDbDecision(decision);

      const { data, error } = await supabase
        .from('decisions')
        .update(dbDecision)
        .eq('id', decision.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating decision:', error);
        await auditService.logEvent('update_decision_failed', 'decision', decision.id, { 
          error: error.message 
        });
        throw error;
      }

      await auditService.logEvent('update_decision_success', 'decision', decision.id, { 
        title: decision.title,
        stage: decision.stage
      });

      console.log('Successfully updated decision:', data.id);
      return this.convertToDecision(data);
    } catch (error) {
      console.error('Error in updateDecision:', error);
      throw error;
    }
  },

  async deleteDecision(id: string): Promise<void> {
    try {
      console.log('Deleting decision with security logging:', id);
      
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting decision:', error);
        await auditService.logEvent('delete_decision_failed', 'decision', id, { 
          error: error.message 
        });
        throw error;
      }

      await auditService.logEvent('delete_decision_success', 'decision', id);
      console.log('Successfully deleted decision:', id);
    } catch (error) {
      console.error('Error in deleteDecision:', error);
      throw error;
    }
  },

  convertToDecision(dbDecision: any): Decision {
    return {
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
    };
  },

  convertToDbDecision(decision: Decision): any {
    const dbDecision: any = {
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
  },

  calculateReflectionDates(createdAt: Date) {
    const sevenDayDate = new Date(createdAt);
    sevenDayDate.setDate(sevenDayDate.getDate() + 7);
    
    const thirtyDayDate = new Date(createdAt);
    thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
    
    const ninetyDayDate = new Date(createdAt);
    ninetyDayDate.setDate(ninetyDayDate.getDate() + 90);
    
    return { sevenDayDate, thirtyDayDate, ninetyDayDate };
  }
};

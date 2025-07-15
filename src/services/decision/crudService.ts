
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/Decision';
import { convertToDecision, convertToDbDecision } from './conversionService';
import { setupReflectionIntervals } from './reflectionDateService';
import { retryRequest, handleNetworkError } from './networkUtils';

export const crudService = {
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
      throw handleNetworkError(error);
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
      
      // Auto-set reflection dates if moving to 'executed' stage
      newDecision.reflection = setupReflectionIntervals(decision, now);

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
      throw handleNetworkError(error);
    }
  },

  // Update existing decision
  async updateDecision(decision: Decision): Promise<Decision> {
    try {
      console.log('Updating decision:', decision.id);
      
      // Auto-set reflection dates if moving to 'executed' stage for the first time
      const updatedDecision = { ...decision };
      // Ensure createdAt is a Date object for reflection setup
      const createdAtDate = decision.createdAt instanceof Date ? decision.createdAt : new Date(decision.createdAt);
      updatedDecision.reflection = setupReflectionIntervals(decision, createdAtDate);
      
      const dbDecision = convertToDbDecision(updatedDecision);

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
      throw handleNetworkError(error);
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
      throw handleNetworkError(error);
    }
  }
};

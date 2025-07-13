
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/Decision';
import { convertToDecision, convertToDbDecision } from './conversionUtils';
import { retryRequest, handleNetworkError } from './networkUtils';
import { setupReflectionIntervals } from './reflectionUtils';

export const crudOperations = {
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
      throw handleNetworkError(error);
    }
  },

  // Create new decision
  async createDecision(decision: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    try {
      console.log('Creating new decision:', decision.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const newDecision = { ...decision, id: '', createdAt: now };
      
      // Auto-set reflection dates if moving to 'executed' stage
      const reflection = setupReflectionIntervals(newDecision, now);
      if (reflection) {
        newDecision.reflection = reflection;
      }

      const dbDecision = {
        ...convertToDbDecision(newDecision),
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
      throw handleNetworkError(error);
    }
  },

  // Update existing decision
  async updateDecision(decision: Decision): Promise<Decision> {
    try {
      console.log('Updating decision:', decision.id);
      
      // Auto-set reflection dates if moving to 'executed' stage for the first time
      const reflection = setupReflectionIntervals(decision);
      if (reflection) {
        decision.reflection = reflection;
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

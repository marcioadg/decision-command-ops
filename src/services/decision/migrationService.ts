
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/Decision';
import { convertToDbDecision } from './conversionUtils';
import { retryRequest, handleNetworkError } from './networkUtils';

export const migrationService = {
  // Migrate localStorage decisions to database - updated for flexible company support
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

      // Get user's profile to determine company context (gracefully handle no company)
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
      throw handleNetworkError(error);
    }
  }
};


import { supabase } from '@/integrations/supabase/client';

export interface MissionUpdate {
  mission: string | null;
}

export const missionService = {
  // Get current user's mission
  async getUserMission(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('mission')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user mission:', error);
        throw error;
      }

      return data?.mission || null;
    } catch (error) {
      console.error('Error in getUserMission:', error);
      throw error;
    }
  },

  // Update current user's mission
  async updateUserMission(mission: string | null): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate mission length
      if (mission && mission.length > 500) {
        throw new Error('Mission statement cannot exceed 500 characters');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ mission: mission?.trim() || null })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user mission:', error);
        throw error;
      }

      console.log('Mission updated successfully');
    } catch (error) {
      console.error('Error in updateUserMission:', error);
      throw error;
    }
  }
};

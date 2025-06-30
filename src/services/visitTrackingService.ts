
import { supabase } from '@/integrations/supabase/client';

export const visitTrackingService = {
  async trackPageVisit(pageName: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update last visit time in profiles
      await supabase
        .from('profiles')
        .update({ last_visit_at: new Date().toISOString() })
        .eq('id', user.id);

      // Log the page visit in audit logs
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'page_visit',
          resource_type: 'page',
          resource_id: pageName,
          details: { page: pageName, timestamp: new Date().toISOString() }
        });

    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  },

  async updateSessionVisits(sessionId: string) {
    try {
      // First get the current page_visits count
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('page_visits')
        .eq('id', sessionId)
        .single();

      const currentVisits = currentSession?.page_visits || 0;

      // Update with incremented count
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          page_visits: currentVisits + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session visits:', error);
    }
  },

  async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }
};

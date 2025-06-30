
import { supabase } from '@/integrations/supabase/client';
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';

export const supabaseUserService = {
  async getAll(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((profile) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email || 'No email provided',
        companyId: profile.company_id || '',
        companyName: profile.companies?.name || 'No Company',
        role: profile.role as 'user' | 'company_admin',
        isActive: true,
        lastLogin: profile.last_login_at || undefined,
        loginCount: profile.login_count || 0,
        createdAt: new Date(profile.created_at).toISOString(),
        updatedAt: new Date(profile.updated_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateAdminUserData>): Promise<AdminUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          company_id: data.companyId,
          role: data.role,
          email: data.email
        })
        .eq('id', id)
        .select(`
          *,
          companies(name)
        `)
        .single();

      if (error) throw error;

      await this.logAuditEvent('update', 'user', id, data);

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email || 'No email provided',
        companyId: profile.company_id || '',
        companyName: profile.companies?.name || 'No Company',
        role: profile.role as 'user' | 'company_admin',
        isActive: true,
        lastLogin: profile.last_login_at || undefined,
        loginCount: profile.login_count || 0,
        createdAt: new Date(profile.created_at).toISOString(),
        updatedAt: new Date(profile.updated_at).toISOString()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await this.logAuditEvent('delete', 'user', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  },

  async logAuditEvent(action: string, resourceType: string, resourceId?: string, details?: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          company_id: profile?.company_id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }
};

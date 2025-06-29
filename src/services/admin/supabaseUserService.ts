
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

      // Get user emails from auth metadata
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          try {
            // For admin users, we can get email from the auth.users table via RPC
            // For now, we'll use a placeholder until we implement proper email fetching
            let email = 'user@example.com';
            
            // Try to get the actual email from Supabase auth
            const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
            if (authData?.user?.email) {
              email = authData.user.email;
            }

            return {
              id: profile.id,
              name: profile.name,
              email: email,
              companyId: profile.company_id || '',
              companyName: profile.companies?.name || 'No Company',
              role: profile.role as 'user' | 'company_admin',
              isActive: true, // This would need to be tracked separately
              createdAt: new Date(profile.created_at).toISOString(),
              updatedAt: new Date(profile.updated_at).toISOString()
            };
          } catch (emailError) {
            // If we can't fetch the email, use a placeholder
            return {
              id: profile.id,
              name: profile.name,
              email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@${profile.companies?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown'}.com`,
              companyId: profile.company_id || '',
              companyName: profile.companies?.name || 'No Company',
              role: profile.role as 'user' | 'company_admin',
              isActive: true,
              createdAt: new Date(profile.created_at).toISOString(),
              updatedAt: new Date(profile.updated_at).toISOString()
            };
          }
        })
      );

      return usersWithEmails;
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
          role: data.role
        })
        .eq('id', id)
        .select(`
          *,
          companies(name)
        `)
        .single();

      if (error) throw error;

      // Log the update
      await this.logAuditEvent('update', 'user', id, data);

      // Get email for the updated user
      let email = data.email || 'user@example.com';
      try {
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
        if (authData?.user?.email) {
          email = authData.user.email;
        }
      } catch (emailError) {
        console.log('Could not fetch email for user:', emailError);
      }

      return {
        id: profile.id,
        name: profile.name,
        email: email,
        companyId: profile.company_id || '',
        companyName: profile.companies?.name || 'No Company',
        role: profile.role as 'user' | 'company_admin',
        isActive: true,
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

      // Log the deletion
      await this.logAuditEvent('delete', 'user', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
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

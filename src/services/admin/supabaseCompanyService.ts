
import { supabase } from '@/integrations/supabase/client';
import { Company, CreateCompanyData } from '@/types/admin/Company';

export interface SupabaseCompany {
  id: string;
  name: string;
  domain: string;
  description?: string;
  user_limit: number;
  is_active: boolean;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    domainRestriction: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const supabaseCompanyService = {
  async getAll(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(company => ({
        id: company.id,
        name: company.name,
        domain: company.domain,
        description: company.description,
        userLimit: company.user_limit,
        userCount: company.profiles?.[0]?.count || 0,
        isActive: company.is_active,
        settings: company.settings,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  async create(data: CreateCompanyData): Promise<Company> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          domain: data.domain,
          description: data.description,
          user_limit: data.userLimit,
          settings: data.settings
        })
        .select()
        .single();

      if (error) throw error;

      // Log the creation
      await this.logAuditEvent('create', 'company', company.id, {
        name: data.name,
        domain: data.domain
      });

      return {
        id: company.id,
        name: company.name,
        domain: company.domain,
        description: company.description,
        userLimit: company.user_limit,
        userCount: 0,
        isActive: company.is_active,
        settings: company.settings,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at)
      };
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateCompanyData>): Promise<Company | null> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .update({
          name: data.name,
          domain: data.domain,
          description: data.description,
          user_limit: data.userLimit,
          settings: data.settings
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the update
      await this.logAuditEvent('update', 'company', id, data);

      return {
        id: company.id,
        name: company.name,
        domain: company.domain,
        description: company.description,
        userLimit: company.user_limit,
        userCount: 0, // Would need separate query for accurate count
        isActive: company.is_active,
        settings: company.settings,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at)
      };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the deletion
      await this.logAuditEvent('delete', 'company', id);
    } catch (error) {
      console.error('Error deleting company:', error);
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
      // Don't throw here to avoid breaking main operations
    }
  }
};

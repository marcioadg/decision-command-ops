
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  userId?: string;
  companyId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export const auditService = {
  async logEvent(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let companyId = null;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
        
        companyId = profile?.company_id;
      }

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          company_id: companyId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address: null, // Would need server-side implementation for real IP
          user_agent: navigator.userAgent
        });

      console.log('Audit event logged:', { action, resourceType, resourceId });
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw to avoid breaking main operations
    }
  },

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        userId: log.user_id,
        companyId: log.company_id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address || undefined,
        userAgent: log.user_agent,
        createdAt: new Date(log.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  async getSecurityEvents(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action', ['sign_in_failed', 'unauthorized_access', 'permission_denied'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(log => ({
        id: log.id,
        userId: log.user_id,
        companyId: log.company_id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address || undefined,
        userAgent: log.user_agent,
        createdAt: new Date(log.created_at)
      })) || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }
};

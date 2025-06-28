
-- Create companies table for proper multi-tenant structure
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  description TEXT,
  user_limit INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{
    "allowSelfRegistration": false,
    "requireApproval": true,
    "domainRestriction": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add company_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Add company_id to decisions table for multi-tenant isolation
ALTER TABLE public.decisions 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Create audit log table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_company_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'company_admin') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for companies table
CREATE POLICY "Users can view their own company" 
  ON public.companies 
  FOR SELECT 
  USING (
    id = public.get_user_company_id() OR 
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can manage companies" 
  ON public.companies 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- Enhanced RLS policies for decisions table
DROP POLICY IF EXISTS "Users can view their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can create their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can update their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can delete their own decisions" ON public.decisions;

CREATE POLICY "Users can view decisions in their company" 
  ON public.decisions 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can create decisions in their company" 
  ON public.decisions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    (company_id = public.get_user_company_id() OR company_id IS NULL)
  );

CREATE POLICY "Users can update their own decisions or company admins can update company decisions" 
  ON public.decisions 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can delete their own decisions or company admins can delete company decisions" 
  ON public.decisions 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

-- Enhanced RLS policies for profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view profiles in their company" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Company admins can update profiles in their company" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

-- RLS policies for audit logs
CREATE POLICY "Users can view audit logs for their company" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    (company_id = public.get_user_company_id() AND public.is_company_admin()) OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_companies_domain ON public.companies(domain);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_decisions_company_id ON public.decisions(company_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Update trigger for companies table
CREATE TRIGGER on_companies_updated
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-populate company_id for existing data (run after companies are created)
-- This will need to be run manually after initial company setup
-- UPDATE public.profiles SET company_id = (SELECT id FROM public.companies LIMIT 1) WHERE company_id IS NULL;
-- UPDATE public.decisions SET company_id = (SELECT company_id FROM public.profiles WHERE profiles.id = decisions.user_id) WHERE company_id IS NULL;

-- Baseline migration for staging schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  user_limit integer NOT NULL DEFAULT 50,
  settings jsonb DEFAULT '{"requireApproval": true, "domainRestriction": false, "allowSelfRegistration": false}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'user'::text,
  company_id uuid REFERENCES public.companies(id),
  mission text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  login_count integer DEFAULT 0,
  last_login_at timestamp with time zone,
  last_visit_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create decisions table
CREATE TABLE IF NOT EXISTS public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  stage text NOT NULL,
  priority text NOT NULL,
  confidence integer NOT NULL,
  owner text NOT NULL,
  notes text,
  bias_check text,
  archived boolean NOT NULL DEFAULT false,
  user_id uuid,
  company_id uuid REFERENCES public.companies(id),
  pre_analysis jsonb,
  reflection_questions text[],
  reflection_answers text[],
  reflection_was_correct boolean,
  reflection_30_day_date timestamp with time zone,
  reflection_30_day_answers text[],
  reflection_30_day_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  company_id uuid REFERENCES public.companies(id),
  resource_type text NOT NULL,
  resource_id text,
  action text NOT NULL,
  details jsonb,
  ip_address inet,
  user_agent text,
  teste varchar,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  page_visits integer DEFAULT 1,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Test table removed - not needed in production

-- Staging connection test table removed - not needed in production
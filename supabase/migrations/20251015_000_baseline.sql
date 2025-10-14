-- baseline, staging
BEGIN;

-- precisa para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tabela base (sem depender de ninguém)
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  domain          text NOT NULL UNIQUE,
  description     text,
  user_limit      integer NOT NULL DEFAULT 50,
  is_active       boolean NOT NULL DEFAULT true,
  settings        jsonb DEFAULT '{"requireApproval": true, "domainRestriction": false, "allowSelfRegistration": false}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2) Tabelas que dependem de auth.users e/ou companies
CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY,                    -- = auth.users.id
  name            text NOT NULL,
  role            text NOT NULL DEFAULT 'user' CHECK (role = ANY (ARRAY['user','admin','company_admin'])),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  company_id      uuid,
  onboarding_completed boolean NOT NULL DEFAULT false,
  mission         text CHECK (length(mission) <= 500),
  email           text,
  last_login_at   timestamptz,
  login_count     integer DEFAULT 0,
  last_visit_at   timestamptz
);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id);

CREATE TABLE public.decisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  title           text NOT NULL,
  category        text NOT NULL,
  stage           text NOT NULL CHECK (stage = ANY (ARRAY['backlog','considering','committed','executed','lessons'])),
  priority        text NOT NULL,
  confidence      integer NOT NULL,
  owner           text NOT NULL,
  notes           text,
  bias_check      text,
  archived        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  reflection_30_day_date       timestamptz,
  reflection_30_day_completed  boolean DEFAULT false,
  company_id      uuid,
  pre_analysis    jsonb,
  -- corrigir tipos inválidos "ARRAY"
  reflection_was_correct boolean,
  reflection_questions  text[],
  reflection_answers    text[],
  reflection_30_day_answers text[]
);

ALTER TABLE public.decisions
  ADD CONSTRAINT decisions_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- 3) Log e sessões (dependem de users/companies)
CREATE TABLE public.audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid,
  company_id      uuid,
  action          text NOT NULL,
  resource_type   text NOT NULL,
  resource_id     text,
  details         jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  teste           varchar
);

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id);

CREATE TABLE public.user_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  session_start   timestamptz NOT NULL DEFAULT now(),
  session_end     timestamptz,
  ip_address      inet,
  user_agent      text,
  page_visits     integer DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_sessions
  ADD CONSTRAINT user_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 4) Tabela independente
CREATE TABLE public.teste (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

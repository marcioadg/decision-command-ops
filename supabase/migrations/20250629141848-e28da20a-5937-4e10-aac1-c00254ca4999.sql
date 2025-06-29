
-- First, let's add proper RLS policies for the decisions table
-- Enable RLS on decisions table (if not already enabled)
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can view their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can create their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can update their own decisions" ON public.decisions;
DROP POLICY IF EXISTS "Users can delete their own decisions" ON public.decisions;

-- Create comprehensive RLS policies for decisions table
-- Policy for SELECT operations
CREATE POLICY "Users can view their own decisions" 
ON public.decisions 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR 
  (company_id IS NOT NULL AND company_id = get_user_company_id())
);

-- Policy for INSERT operations
CREATE POLICY "Users can create their own decisions" 
ON public.decisions 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (company_id IS NULL OR company_id = get_user_company_id())
);

-- Policy for UPDATE operations
CREATE POLICY "Users can update their own decisions" 
ON public.decisions 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id OR 
  (company_id IS NOT NULL AND company_id = get_user_company_id())
)
WITH CHECK (
  auth.uid() = user_id AND
  (company_id IS NULL OR company_id = get_user_company_id())
);

-- Policy for DELETE operations
CREATE POLICY "Users can delete their own decisions" 
ON public.decisions 
FOR DELETE 
TO authenticated
USING (
  auth.uid() = user_id OR 
  (company_id IS NOT NULL AND company_id = get_user_company_id())
);

-- Add RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add RLS policies for audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Add RLS policies for companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON public.companies;

CREATE POLICY "Users can view their company" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (id = get_user_company_id());

CREATE POLICY "Admins can view all companies" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Create a function to validate decision input data
CREATE OR REPLACE FUNCTION public.validate_decision_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate title length and content
  IF LENGTH(TRIM(NEW.title)) < 3 OR LENGTH(TRIM(NEW.title)) > 200 THEN
    RAISE EXCEPTION 'Decision title must be between 3 and 200 characters';
  END IF;
  
  -- Validate notes length if provided
  IF NEW.notes IS NOT NULL AND LENGTH(NEW.notes) > 5000 THEN
    RAISE EXCEPTION 'Decision notes cannot exceed 5000 characters';
  END IF;
  
  -- Validate confidence range
  IF NEW.confidence < 1 OR NEW.confidence > 100 THEN
    RAISE EXCEPTION 'Confidence must be between 1 and 100';
  END IF;
  
  -- Ensure user_id is set to current user
  NEW.user_id = auth.uid();
  
  -- Set company_id from user profile if not already set
  IF NEW.company_id IS NULL THEN
    NEW.company_id = get_user_company_id();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for decision validation
DROP TRIGGER IF EXISTS validate_decision_trigger ON public.decisions;
CREATE TRIGGER validate_decision_trigger
  BEFORE INSERT OR UPDATE ON public.decisions
  FOR EACH ROW EXECUTE FUNCTION public.validate_decision_input();

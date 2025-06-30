
-- Add email, login tracking, and visit tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN login_count INTEGER DEFAULT 0,
ADD COLUMN last_visit_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX idx_profiles_last_login_at ON public.profiles(last_login_at);
CREATE INDEX idx_profiles_login_count ON public.profiles(login_count);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Create user_sessions table for detailed visit tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  page_visits INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_sessions (admins can see all)
CREATE POLICY "Admins can view all user sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'company_admin')
    )
  );

-- Create policy for users to see their own sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create function to update user login stats
CREATE OR REPLACE FUNCTION public.update_user_login_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles table with login info
  UPDATE public.profiles 
  SET 
    last_login_at = now(),
    login_count = COALESCE(login_count, 0) + 1,
    last_visit_at = now(),
    email = COALESCE(email, NEW.email)
  WHERE id = NEW.id;
  
  -- Create new session record
  INSERT INTO public.user_sessions (user_id, ip_address)
  VALUES (NEW.id, inet_client_addr());
  
  RETURN NEW;
END;
$$;

-- Create trigger to update login stats when user signs in
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_login_stats();

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, onboarding_completed, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    false,
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Sync existing user emails from auth.users to profiles
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL;

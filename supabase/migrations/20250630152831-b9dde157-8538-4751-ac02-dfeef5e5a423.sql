
-- Add mission field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mission TEXT;

-- Add constraint to limit mission length
ALTER TABLE public.profiles 
ADD CONSTRAINT mission_length_check CHECK (LENGTH(mission) <= 500);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.mission IS 'User''s current most important mission statement (max 500 characters)';

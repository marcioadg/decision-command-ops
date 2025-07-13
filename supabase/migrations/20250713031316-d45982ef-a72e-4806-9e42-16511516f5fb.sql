-- Direct update using system admin privileges to bypass triggers
-- First, let's see what triggers are defined at the PostgreSQL level
SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgrelid = 'public.decisions'::regclass;
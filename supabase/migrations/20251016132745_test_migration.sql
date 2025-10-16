-- Test migration to verify workflow functionality
CREATE TABLE IF NOT EXISTS public.test_migration_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message text NOT NULL DEFAULT 'Workflow test successful',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_migration_workflow ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (it's just a test table)
CREATE POLICY "Anyone can read test migration table"
  ON public.test_migration_workflow
  FOR SELECT
  USING (true);

-- Insert test record
INSERT INTO public.test_migration_workflow (test_message)
VALUES ('Migration test executed at ' || now()::text)
ON CONFLICT DO NOTHING;

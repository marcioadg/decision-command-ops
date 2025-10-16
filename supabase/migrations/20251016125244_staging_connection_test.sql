-- Create staging_connection_test table for testing purposes
CREATE TABLE IF NOT EXISTS public.staging_connection_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staging_connection_test ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (it's just a test table)
CREATE POLICY "Anyone can read test table"
  ON public.staging_connection_test
  FOR SELECT
  USING (true);

-- Allow anyone to insert (it's just a test table)
CREATE POLICY "Anyone can insert test table"
  ON public.staging_connection_test
  FOR INSERT
  WITH CHECK (true);

-- Insert test record
INSERT INTO public.staging_connection_test (test_message)
VALUES ('Migration test - staging_connection_test created via migration at ' || now()::text)
ON CONFLICT DO NOTHING;

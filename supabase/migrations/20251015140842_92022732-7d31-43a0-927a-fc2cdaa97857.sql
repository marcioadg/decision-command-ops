-- Create test table to verify staging connection
CREATE TABLE IF NOT EXISTS public.staging_connection_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staging_connection_test ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (it's just a test table)
CREATE POLICY "Anyone can read test table"
  ON public.staging_connection_test
  FOR SELECT
  USING (true);

-- Insert test record
INSERT INTO public.staging_connection_test (test_message)
VALUES ('Lovable conectado ao staging - teste realizado em ' || now()::text);
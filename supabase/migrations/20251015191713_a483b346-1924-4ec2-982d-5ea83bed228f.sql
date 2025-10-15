-- Create test table to verify staging connection
CREATE TABLE IF NOT EXISTS staging_connection_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  message text DEFAULT 'Connected to STAGING!'
);

-- Insert test record
INSERT INTO staging_connection_test (message) VALUES ('Test record created in Staging environment');
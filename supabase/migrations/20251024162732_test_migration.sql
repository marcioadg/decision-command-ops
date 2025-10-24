-- Insert test record
INSERT INTO public.test_migration_workflow (test_message)
VALUES ('Migration test executed at ' || now()::text)
ON CONFLICT DO NOTHING;

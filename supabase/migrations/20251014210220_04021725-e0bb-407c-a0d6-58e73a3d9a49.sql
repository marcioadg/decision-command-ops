-- Create Acme Corporation company
INSERT INTO companies (name, domain, description, user_limit, settings) 
VALUES (
  'Acme Corporation',
  'acme.com',
  'Acme Corporation - Decision Command Platform',
  100,
  '{"allowSelfRegistration": false, "requireApproval": true, "domainRestriction": false}'::jsonb
)
ON CONFLICT (domain) DO NOTHING;
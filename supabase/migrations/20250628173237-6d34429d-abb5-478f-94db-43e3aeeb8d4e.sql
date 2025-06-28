
-- Add priority column and migrate data from impact/urgency
ALTER TABLE public.decisions 
ADD COLUMN priority TEXT CHECK (priority IN ('high', 'medium', 'low'));

-- Populate priority based on impact (using impact as primary value)
UPDATE public.decisions 
SET priority = impact;

-- Make priority required after populating data
ALTER TABLE public.decisions 
ALTER COLUMN priority SET NOT NULL;

-- Drop the old columns
ALTER TABLE public.decisions 
DROP COLUMN impact,
DROP COLUMN urgency;

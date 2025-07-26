-- Temporarily allow null user_id to handle data migration
ALTER TABLE public.decisions ALTER COLUMN user_id DROP NOT NULL;

-- Clean up decisions with null user_id - delete them as they're invalid
DELETE FROM public.decisions WHERE user_id IS NULL;

-- Now update existing 'decided' stages to 'executed'
UPDATE public.decisions 
SET stage = 'executed' 
WHERE stage = 'decided';

-- Update the stage check constraint to allow 'executed' instead of 'decided'
ALTER TABLE public.decisions 
DROP CONSTRAINT decisions_stage_check;

ALTER TABLE public.decisions 
ADD CONSTRAINT decisions_stage_check 
CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]));

-- Restore the not-null constraint
ALTER TABLE public.decisions ALTER COLUMN user_id SET NOT NULL;
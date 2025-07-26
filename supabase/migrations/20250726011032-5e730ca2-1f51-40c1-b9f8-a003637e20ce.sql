-- Drop the stage check constraint first
ALTER TABLE public.decisions 
DROP CONSTRAINT IF EXISTS decisions_stage_check;

-- Delete decisions with null user_id 
DELETE FROM public.decisions WHERE user_id IS NULL;

-- Now update existing 'decided' stages to 'executed'
UPDATE public.decisions 
SET stage = 'executed' 
WHERE stage = 'decided';

-- Add the new constraint with 'executed' instead of 'decided'
ALTER TABLE public.decisions 
ADD CONSTRAINT decisions_stage_check 
CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]));
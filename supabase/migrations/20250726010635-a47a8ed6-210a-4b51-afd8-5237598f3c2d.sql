-- First, update existing 'decided' stages to 'executed'
UPDATE public.decisions 
SET stage = 'executed' 
WHERE stage = 'decided';

-- Now update the stage check constraint to allow 'executed' instead of 'decided'
ALTER TABLE public.decisions 
DROP CONSTRAINT decisions_stage_check;

ALTER TABLE public.decisions 
ADD CONSTRAINT decisions_stage_check 
CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]));
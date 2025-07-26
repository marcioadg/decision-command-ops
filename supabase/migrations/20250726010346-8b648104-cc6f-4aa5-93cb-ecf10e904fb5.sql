-- Update the stage check constraint to allow 'executed' instead of 'decided'
ALTER TABLE public.decisions 
DROP CONSTRAINT decisions_stage_check;

ALTER TABLE public.decisions 
ADD CONSTRAINT decisions_stage_check 
CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]));
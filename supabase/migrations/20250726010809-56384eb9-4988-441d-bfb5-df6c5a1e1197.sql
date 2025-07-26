-- Disable the trigger that validates user_id temporarily
DROP TRIGGER IF EXISTS validate_decision_input_trigger ON public.decisions;

-- First, check for and handle decisions with null user_id
-- Set a temporary user_id for orphaned decisions (we'll clean them later)
UPDATE public.decisions 
SET user_id = 'bffcea38-ddb5-46bd-806e-a1df07d3205b'::uuid 
WHERE user_id IS NULL;

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

-- Re-enable the trigger
CREATE TRIGGER validate_decision_input_trigger
    BEFORE INSERT OR UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_decision_input();
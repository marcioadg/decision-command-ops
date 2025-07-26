-- Drop triggers that interfere with data migration
DROP TRIGGER IF EXISTS validate_decision_input_trigger ON public.decisions;

-- Drop the stage check constraint first  
ALTER TABLE public.decisions 
DROP CONSTRAINT IF EXISTS decisions_stage_check;

-- Delete invalid decisions with null user_id 
DELETE FROM public.decisions WHERE user_id IS NULL;

-- Now update existing 'decided' stages to 'executed'
UPDATE public.decisions 
SET stage = 'executed' 
WHERE stage = 'decided';

-- Add the new constraint with 'executed' instead of 'decided'
ALTER TABLE public.decisions 
ADD CONSTRAINT decisions_stage_check 
CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]));

-- Recreate the trigger for future operations
CREATE TRIGGER validate_decision_input_trigger
    BEFORE INSERT OR UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_decision_input();
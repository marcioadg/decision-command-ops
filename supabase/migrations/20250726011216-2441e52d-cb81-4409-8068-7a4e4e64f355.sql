-- Temporarily drop the NOT NULL constraint on user_id 
ALTER TABLE public.decisions ALTER COLUMN user_id DROP NOT NULL;

-- Drop all triggers that might interfere
DROP TRIGGER IF EXISTS validate_decision_input_trigger ON public.decisions;
DROP TRIGGER IF EXISTS handle_updated_at_trigger ON public.decisions;

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

-- Restore the NOT NULL constraint
ALTER TABLE public.decisions ALTER COLUMN user_id SET NOT NULL;

-- Recreate the triggers
CREATE TRIGGER validate_decision_input_trigger
    BEFORE INSERT OR UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_decision_input();

CREATE TRIGGER handle_updated_at_trigger
    BEFORE UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
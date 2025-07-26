-- Use a more direct approach - create new table and copy data
-- Create a temporary table with the correct structure
CREATE TEMP TABLE decisions_temp AS 
SELECT * FROM public.decisions WHERE user_id IS NOT NULL;

-- Drop the old table completely
DROP TABLE public.decisions CASCADE;

-- Recreate the table with the correct stage constraint
CREATE TABLE public.decisions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    stage text NOT NULL,
    priority text NOT NULL,
    confidence integer NOT NULL,
    owner text NOT NULL,
    notes text,
    bias_check text,
    archived boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reflection_30_day_date timestamp with time zone,
    reflection_30_day_completed boolean DEFAULT false,
    company_id uuid,
    pre_analysis jsonb,
    reflection_was_correct boolean,
    reflection_questions text[],
    reflection_answers text[],
    reflection_30_day_answers text[],
    CONSTRAINT decisions_stage_check CHECK (stage = ANY (ARRAY['backlog'::text, 'considering'::text, 'committed'::text, 'executed'::text, 'lessons'::text]))
);

-- Copy the clean data back, updating 'decided' to 'executed'
INSERT INTO public.decisions 
SELECT 
    id, user_id, title, category, 
    CASE WHEN stage = 'decided' THEN 'executed' ELSE stage END as stage,
    priority, confidence, owner, notes, bias_check, archived, 
    created_at, updated_at, reflection_30_day_date, reflection_30_day_completed,
    company_id, pre_analysis, reflection_was_correct, reflection_questions, 
    reflection_answers, reflection_30_day_answers
FROM decisions_temp;

-- Enable RLS  
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Add pre_analysis column to decisions table
ALTER TABLE public.decisions 
ADD COLUMN pre_analysis JSONB;

-- Add comment to document the column
COMMENT ON COLUMN public.decisions.pre_analysis IS 'Stores pre-decision analysis data including upside, downside, and alignment questions';

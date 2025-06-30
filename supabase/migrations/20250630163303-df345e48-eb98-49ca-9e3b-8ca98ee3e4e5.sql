
-- Remove 7-day and 90-day reflection columns and add accuracy tracking
ALTER TABLE public.decisions 
DROP COLUMN reflection_7_day_date,
DROP COLUMN reflection_7_day_completed,
DROP COLUMN reflection_7_day_answers,
DROP COLUMN reflection_90_day_date,
DROP COLUMN reflection_90_day_completed,
DROP COLUMN reflection_90_day_answers,
ADD COLUMN reflection_was_correct BOOLEAN;

-- Update existing decisions that are in 'decided' stage to have 30-day reflection dates if they don't already have them
UPDATE public.decisions 
SET reflection_30_day_date = created_at + INTERVAL '30 days'
WHERE stage = 'decided' 
  AND reflection_30_day_date IS NULL 
  AND reflection_questions IS NOT NULL;

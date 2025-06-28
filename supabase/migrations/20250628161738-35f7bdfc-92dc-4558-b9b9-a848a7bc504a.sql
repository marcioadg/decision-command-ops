
-- Add new reflection columns to replace the single reminder date
ALTER TABLE public.decisions 
DROP COLUMN reflection_reminder_date,
ADD COLUMN reflection_7_day_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN reflection_30_day_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN reflection_90_day_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN reflection_7_day_completed BOOLEAN DEFAULT false,
ADD COLUMN reflection_30_day_completed BOOLEAN DEFAULT false,
ADD COLUMN reflection_90_day_completed BOOLEAN DEFAULT false,
ADD COLUMN reflection_7_day_answers TEXT[],
ADD COLUMN reflection_30_day_answers TEXT[],
ADD COLUMN reflection_90_day_answers TEXT[];

-- Update existing decisions that are in 'decided' or 'lessons' stage to have reflection dates
UPDATE public.decisions 
SET 
  reflection_7_day_date = created_at + INTERVAL '7 days',
  reflection_30_day_date = created_at + INTERVAL '30 days',
  reflection_90_day_date = created_at + INTERVAL '90 days'
WHERE stage IN ('decided', 'lessons') AND reflection_questions IS NOT NULL;

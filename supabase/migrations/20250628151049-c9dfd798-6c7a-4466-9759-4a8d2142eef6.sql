
-- Create decisions table
CREATE TABLE public.decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('People', 'Capital', 'Strategy', 'Product', 'Timing', 'Personal')),
  impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  urgency TEXT NOT NULL CHECK (urgency IN ('high', 'medium', 'low')),
  stage TEXT NOT NULL CHECK (stage IN ('backlog', 'considering', 'committed', 'decided', 'lessons')),
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  owner TEXT NOT NULL,
  notes TEXT,
  bias_check TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  reflection_reminder_date TIMESTAMP WITH TIME ZONE,
  reflection_questions TEXT[],
  reflection_answers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own decisions" 
  ON public.decisions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decisions" 
  ON public.decisions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions" 
  ON public.decisions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions" 
  ON public.decisions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decisions_stage ON public.decisions(stage);
CREATE INDEX idx_decisions_created_at ON public.decisions(created_at);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.decisions 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

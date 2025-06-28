
-- Enable real-time updates for the decisions table
ALTER TABLE public.decisions REPLICA IDENTITY FULL;

-- Add the decisions table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;

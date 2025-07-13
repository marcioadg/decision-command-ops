-- First check what triggers exist on decisions table
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'decisions';
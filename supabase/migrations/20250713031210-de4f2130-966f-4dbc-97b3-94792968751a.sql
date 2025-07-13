-- Check all triggers and functions on decisions table
SELECT t.trigger_name, t.event_manipulation, t.action_timing, p.proname as function_name
FROM information_schema.triggers t
JOIN pg_proc p ON p.oid = (
    SELECT oid FROM pg_proc 
    WHERE proname = regexp_replace(t.action_statement, '.*EXECUTE FUNCTION ([^(]+).*', '\1')
    LIMIT 1
)
WHERE t.event_object_table = 'decisions'
AND t.event_object_schema = 'public';
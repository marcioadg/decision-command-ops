-- Update while explicitly preserving user_id
UPDATE decisions 
SET stage = 'executed', 
    user_id = user_id  -- Explicitly preserve the existing user_id
WHERE stage = 'decided';
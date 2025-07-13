-- Simple update of just the stage column
UPDATE decisions 
SET stage = 'executed'
WHERE stage = 'decided';
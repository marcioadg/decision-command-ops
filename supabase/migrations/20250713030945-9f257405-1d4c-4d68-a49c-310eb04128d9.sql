-- Update all existing decisions with 'decided' stage to 'executed'
UPDATE decisions 
SET stage = 'executed' 
WHERE stage = 'decided';
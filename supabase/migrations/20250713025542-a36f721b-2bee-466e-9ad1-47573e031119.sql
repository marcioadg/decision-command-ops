-- Update all existing decisions with 'Decided' stage to 'EXECUTED'
UPDATE decisions 
SET stage = 'EXECUTED' 
WHERE stage = 'Decided';
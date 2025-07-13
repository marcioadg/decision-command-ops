-- Update decisions with 'decided' stage to 'executed' one by one
UPDATE decisions 
SET stage = 'executed', updated_at = now()
WHERE stage = 'decided' 
AND id = 'ca02902f-6392-497e-8159-1d82bf18e47e';

-- First, let's see what confidence values we have in the database
-- and fix the constraint properly

-- Drop the existing constraint that's causing issues
ALTER TABLE decisions DROP CONSTRAINT IF EXISTS decisions_confidence_check;

-- Add the new constraint that allows 0-100
ALTER TABLE decisions ADD CONSTRAINT decisions_confidence_check CHECK ((confidence >= 0) AND (confidence <= 100));

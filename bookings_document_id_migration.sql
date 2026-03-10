-- Migration to add document verification to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS document_id TEXT;

-- Optional: Add a check constraint for document types if you want to restrict them at the DB level
-- ALTER TABLE bookings ADD CONSTRAINT check_document_type 
-- CHECK (document_type IN ('Aadhar Card', 'Passport', 'Driving Licence', 'Voter ID Card', 'Other'));

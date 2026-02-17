-- Add new columns to hotel_rooms table
ALTER TABLE hotel_rooms 
ADD COLUMN IF NOT EXISTS bed_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_ac BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS price_two_guests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_three_plus_guests INTEGER DEFAULT 0;

-- Migrate existing price_two_plus_guests to price_two_guests
UPDATE hotel_rooms 
SET price_two_guests = price_two_plus_guests 
WHERE price_two_guests = 0;

-- Optional: If we want to drop the old column later, we can, but keeping it for now to avoid breakage until code is full updated.

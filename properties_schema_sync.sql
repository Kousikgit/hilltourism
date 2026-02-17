-- Add stay_category and total_rooms to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS stay_category TEXT CHECK (stay_category IN ('Mountain View', 'River Side', 'Tea Estate', 'Heritage Stays', 'Offbeat Stays', 'Workstation')),
ADD COLUMN IF NOT EXISTS total_rooms INTEGER DEFAULT 1;

-- Update RLS policies if needed (usually not required for simple column adds if table policies exist)
-- But ensuring public access to these new columns is implicit in 'Viewable by everyone' policies
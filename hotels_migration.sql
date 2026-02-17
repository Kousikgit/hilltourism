-- 1. Create Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Standard', 'Premium', 'Luxury')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  total_rooms INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Policies for Hotels
-- (Drop first to avoid errors if re-running)
DROP POLICY IF EXISTS "Hotels are viewable by everyone" ON hotels;
CREATE POLICY "Hotels are viewable by everyone" ON hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to hotels" ON hotels;
CREATE POLICY "Admins have full access to hotels" ON hotels FOR ALL USING (is_admin());


-- 2. Create Hotel Rooms Table
CREATE TABLE IF NOT EXISTS hotel_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  price_one_guest DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_two_plus_guests DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Hotel Rooms
ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;

-- Policies for Hotel Rooms
DROP POLICY IF EXISTS "Hotel Rooms are viewable by everyone" ON hotel_rooms;
CREATE POLICY "Hotel Rooms are viewable by everyone" ON hotel_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to hotel rooms" ON hotel_rooms;
CREATE POLICY "Admins have full access to hotel rooms" ON hotel_rooms FOR ALL USING (is_admin());


-- 3. Update Bookings Table (Add Foreign Keys safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'hotel_id') THEN
        ALTER TABLE bookings ADD COLUMN hotel_id UUID REFERENCES hotels(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'hotel_room_id') THEN
        ALTER TABLE bookings ADD COLUMN hotel_room_id UUID REFERENCES hotel_rooms(id);
    END IF;
END $$;

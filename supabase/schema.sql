-- Database Schema for Homestay Booking Website

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Standard', 'Premium', 'Luxury')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0, -- Optional discount percentage
  max_guests INTEGER NOT NULL DEFAULT 20,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  guest_prices JSONB DEFAULT '{}', -- { "one": 1000, "two": 1800, "extra": 500 }
  total_rooms INTEGER DEFAULT 1,
  stay_category TEXT CHECK (stay_category IN ('Mountain View', 'River Side', 'Tea Estate', 'Heritage Stays', 'Offbeat Stays', 'Workstation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1 Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Standard', 'Premium', 'Luxury')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Starting price
  discount_percent INTEGER DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  total_rooms INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Room Types / Categories
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  price_one_guest DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_two_plus_guests DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.1 Hotel Room Types
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

-- 4. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id), -- For homestays
  hotel_id UUID REFERENCES hotels(id), -- For hotels
  room_id UUID REFERENCES rooms(id), -- For homestay rooms (if any)
  hotel_room_id UUID REFERENCES hotel_rooms(id), -- For hotel rooms
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  token_amount DECIMAL(10, 2),
  guests INTEGER DEFAULT 1,
  adults INTEGER DEFAULT 1,
  children_5_8 INTEGER DEFAULT 0,
  children_below_5 INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Availability (Optional but recommended for performance)
-- Alternatively, we can calculate availability on the fly from bookings.
CREATE TABLE IF NOT EXISTS room_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  date DATE NOT NULL,
  available_count INTEGER NOT NULL,
  UNIQUE(room_id, date)
);
-- 6. Profiles & Roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'regular' CHECK (role IN ('admin', 'regular')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check if current user is an admin (Security Definer avoids RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'regular');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security: Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Everyone can view profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can manage everything in profiles (using is_admin() bypasses recursion)
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (is_admin());

-- 2. Locations Policies
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to locations" ON locations;
CREATE POLICY "Admins have full access to locations" ON locations FOR ALL USING (is_admin());

-- 3. Properties Policies
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;
CREATE POLICY "Admins have full access to properties" ON properties FOR ALL USING (is_admin());

-- 4. Rooms Policies
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON rooms;
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to rooms" ON rooms;
CREATE POLICY "Admins have full access to rooms" ON rooms FOR ALL USING (is_admin());

-- 5. Bookings Policies
DROP POLICY IF EXISTS "Admins have full access to bookings" ON bookings;
CREATE POLICY "Admins have full access to bookings" ON bookings FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;
CREATE POLICY "Anyone can create a booking" ON bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 7. Storage Policies (Files)
-- Ensure the bucket exists (this is usually done via UI, but policies depend on it)
-- Note: You must create a public bucket named 'property-images' in your Supabase Dashboard if it doesn't exist.

-- Allow public access to view images
DROP POLICY IF EXISTS "Public Access to Property Images" ON storage.objects;
CREATE POLICY "Public Access to Property Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-images' );

-- Allow authenticated users (Admins) to upload images
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (Admins) to delete images
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (Admins) to update images
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);


import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: 'c:/Users/DELL/OneDrive/Desktop/Tourism/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    console.log("Checking Tours...");
    const { data: tours, error: toursError } = await supabase.from('tours').select('count');
    if (toursError) console.error("Error fetching tours:", toursError);
    else console.log("Tours count:", tours);

    console.log("Checking Locations...");
    const { data: locations, error: locationsError } = await supabase.from('locations').select('count');
    if (locationsError) console.error("Error fetching locations:", locationsError);
    else console.log("Locations count:", locations);

    console.log("Checking Hotels...");
    const { data: hotels, error: hotelsError } = await supabase.from('hotels').select('count');
    if (hotelsError) console.error("Error fetching hotels:", hotelsError);
    else console.log("Hotels count:", hotels);
}

checkData();

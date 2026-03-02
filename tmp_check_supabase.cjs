
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://neqriucmirzqhvnezzik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcXJpdWNtaXJ6cWh2bmV6emlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjcwODksImV4cCI6MjA4NTg0MzA4OX0.JtUQ8E3vZBupifzDo9T2Um7_RjaKbxjfUr0rAcO9CmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    try {
        console.log("Checking Tours...");
        const { data: tours, error: toursError } = await supabase.from('tours').select('*', { count: 'exact', head: true });
        if (toursError) console.error("Error fetching tours:", toursError);
        else console.log("Tours count:", tours, "Exact count:", toursError ? 'N/A' : '');

        // Just select * to see if we get anything
        const { data: toursData, error: toursDataError } = await supabase.from('tours').select('*').limit(1);
        console.log("Tours sample:", toursData);

        console.log("Checking Locations...");
        const { data: locationsData, error: locationsDataError } = await supabase.from('locations').select('*').limit(1);
        console.log("Locations sample:", locationsData);

        console.log("Checking Hotels...");
        const { data: hotelsData, error: hotelsDataError } = await supabase.from('hotels').select('*').limit(1);
        console.log("Hotels sample:", hotelsData);

    } catch (e) {
        console.error("Script error:", e);
    }
}

checkData();

import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

    if (!apiKey || !placeId || apiKey === 'YOUR_API_KEY_HERE' || placeId === 'YOUR_PLACE_ID_HERE') {
        return NextResponse.json({ error: 'Google API configuration missing' }, { status: 500 });
    }

    try {
        // Fetch place details including reviews from Google Places API
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(data.error_message || 'Failed to fetch reviews');
        }

        // Return the relevant data
        return NextResponse.json({
            reviews: data.result.reviews || [],
            rating: data.result.rating,
            user_ratings_total: data.result.user_ratings_total
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

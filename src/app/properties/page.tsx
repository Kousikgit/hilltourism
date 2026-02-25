"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Filter, Search, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { homestayService, Property, Location } from '@/lib/services';
import { cn } from '@/lib/utils';

function PropertiesContent() {
    const searchParams = useSearchParams();
    const locationFilter = searchParams.get('location');
    const checkIn = searchParams.get('checkin');
    const checkOut = searchParams.get('checkout');
    const guests = searchParams.get('guests');

    const [properties, setProperties] = useState<Property[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(locationFilter || '');

    useEffect(() => {
        if (locationFilter) {
            setSelectedLocation(locationFilter);
        }
    }, [locationFilter]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [props, locs] = await Promise.all([
                    homestayService.getProperties(),
                    homestayService.getLocations()
                ]);

                let availableProps = props || [];

                // Filter by Guests
                if (guests) {
                    const guestCount = parseInt(guests);
                    availableProps = availableProps.filter(p => p.max_guests >= guestCount);
                }

                // Filter by Date Availability
                if (checkIn && checkOut) {
                    const availablePropsPromises = availableProps.map(async (p) => {
                        try {
                            const isAvailable = await homestayService.checkAvailability(p.id, checkIn, checkOut);
                            return isAvailable ? p : null;
                        } catch (err) {
                            console.error(`Error checking availability for ${p.name}:`, err);
                            return null;
                        }
                    });

                    const results = await Promise.all(availablePropsPromises);
                    availableProps = results.filter(p => p !== null) as Property[];
                }

                setProperties(availableProps);
                setLocations(locs || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [checkIn, checkOut, guests]);

    const filteredProperties = properties.filter(prop => {
        if (selectedLocation && prop.location_id !== selectedLocation) return false;
        return true;
    });

    const isFilteredByDate = !!(checkIn && checkOut);

    if (loading) {
        return (
            <div className="pt-40 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">
                    {isFilteredByDate ? 'Checking Availability...' : 'Loading Stays...'}
                </p>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2 tracking-tight">Available Stays</h1>
                    <p className="text-neutral-600">
                        {isFilteredByDate
                            ? `Showing available stays for ${guests || 1} guest(s) from ${new Date(checkIn!).toLocaleDateString()} to ${new Date(checkOut!).toLocaleDateString()}`
                            : "Discover handpicked homestays for your next adventure."
                        }
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-neutral-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all outline-none appearance-none cursor-pointer text-neutral-900 font-medium"
                        >
                            <option value="">All Locations</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-[2.5rem] border border-neutral-100">
                    <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No properties found</h3>
                    <p className="text-neutral-500">
                        {isFilteredByDate
                            ? "No stays available for your selected dates and filters."
                            : "Try selecting a different location."}
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6 rounded-full"
                        onClick={() => {
                            setSelectedLocation('');
                            // Optional: Clear date params via router.push if we want to reset everything
                            // router.push('/properties'); 
                        }}
                    >
                        Clear Location Filter
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map((prop) => {
                        const locationName = locations.find(l => l.id === prop.location_id)?.name || 'Unknown Location';
                        return (
                            <Link
                                key={prop.id}
                                href={`/properties/${prop.id}${isFilteredByDate ? `?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}` : ''}`}
                                className="group block bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500"
                            >
                                <div className="relative h-64 overflow-hidden bg-neutral-100">
                                    {prop.images && prop.images.length > 0 ? (
                                        <Image
                                            src={prop.images[0]}
                                            alt={prop.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            <Building2 className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "absolute top-6 left-6 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                                        prop.category === 'Luxury' ? 'bg-purple-500/80' :
                                            prop.category === 'Premium' ? 'bg-amber-500/80' :
                                                'bg-blue-600/80'
                                    )}>
                                        {prop.category}
                                    </div>
                                    <div className="absolute top-6 right-6 z-10 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        3 Meal Included
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex flex-col gap-1 mb-4">
                                        <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
                                            <MapPin className="w-4 h-4 text-primary-500" />
                                            {locationName}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors truncate">
                                        {prop.name}
                                    </h3>
                                    <div className="flex justify-between items-center pt-6 border-t border-neutral-100">
                                        <div className="flex flex-col">
                                            {prop.discount_percent && prop.discount_percent > 0 ? (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-bold text-neutral-900">₹{Math.round((prop.guest_prices?.one || prop.price) * (1 - prop.discount_percent / 100))}</span>
                                                    <span className="text-xs font-medium text-neutral-400 line-through decoration-primary-500/50">₹{prop.guest_prices?.one || prop.price}</span>
                                                </div>
                                            ) : prop.guest_prices?.one ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Starts from</span>
                                                    <span className="text-xl font-bold text-neutral-900">₹{prop.guest_prices.one}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xl font-bold text-neutral-900">₹{prop.price}</span>
                                            )}
                                            <span className="text-neutral-500 text-xs font-medium">/night/person</span>
                                        </div>
                                        <Button size="sm" className="rounded-full shadow-lg shadow-primary-600/10">Book Now</Button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="pt-40 text-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}

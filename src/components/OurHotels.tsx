'use client';

import { useEffect, useState } from 'react';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { homestayService, Hotel, Location } from '@/lib/services';
import { HotelCard } from './HotelCard';
import Link from 'next/link';

export function OurHotels() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelData, locationData] = await Promise.all([
                    homestayService.getHotels(),
                    homestayService.getLocations()
                ]);
                setHotels(hotelData);
                setLocations(locationData);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">Opening the Lobby...</p>
            </div>
        );
    }

    if (!hotels.length) return null;

    return (
        <section id="our-hotels" className="py-24 px-4 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                            <Building2 className="w-3 h-3" />
                            Premium Hospitalities
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter leading-tight uppercase italic-none">
                            Our <span className="text-primary-600">Hotels</span>
                        </h2>
                        <p className="text-neutral-500 max-w-xl text-lg font-medium">
                            Experience luxury and comfort in our handpicked selection of premium hotels across the Himalayan foothills.
                        </p>
                    </div>

                    <Link href="/hotels" className="hidden md:block">
                        <Button variant="glass" className="rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[10px] group">
                            Explore All Hotels
                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotels.slice(0, 3).map((hotel) => (
                        <HotelCard
                            key={hotel.id}
                            hotel={hotel}
                            locationName={locations.find(l => l.id === hotel.location_id)?.name}
                        />
                    ))}
                </div>

                <div className="md:hidden pt-8">
                    <Link href="/hotels">
                        <Button variant="glass" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]">
                            View All Hotels
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

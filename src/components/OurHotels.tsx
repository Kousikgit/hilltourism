'use client';

import { useEffect, useState } from 'react';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { homestayService, Hotel, Location } from '@/lib/services';
import { HotelCard } from './HotelCard';
import { HotelCarousel } from './HotelCarousel';
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
        <section id="our-hotels" className="relative py-16 px-4 bg-primary-50/60 dark:bg-primary-900/20 overflow-hidden">
            {/* Subtle background pattern to add texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] dark:opacity-[0.1]" />
            <div className="max-w-7xl mx-auto space-y-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                            <Building2 className="w-3 h-3" />
                            Premium Hospitalities
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            Our <span className="text-primary-600 dark:text-primary-500">Hotels</span>
                        </h2>
                        <p className="text-neutral-500 max-w-xl text-lg font-medium">
                            Experience luxury and comfort in our handpicked selection of premium hotels across the Himalayan foothills.
                        </p>
                    </div>
                </div>

                <HotelCarousel
                    hotels={hotels}
                    locations={locations}
                />

                <div className="text-center pt-0">
                    <Link href="/hotels" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm hover:gap-3 transition-all group border border-primary-600/20 px-6 py-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/10">
                        Explore All Hotels
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import { Hotel } from '@/lib/services';
import { cn } from '@/lib/utils';

interface HotelCardProps {
    hotel: Hotel;
    locationName?: string;
    className?: string;
}

export function HotelCard({ hotel, locationName, className }: HotelCardProps) {
    return (
        <Link
            href={`/hotels/${hotel.id}`}
            className={cn(
                "group block bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500",
                className
            )}
        >
            <div className="relative h-72 overflow-hidden">
                <Image
                    src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'}
                    alt={hotel.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-60" />

                {/* Top Left: Badge */}
                <div className="absolute top-6 left-6">
                    <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {hotel.category} Collection
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-bold uppercase tracking-[0.2em]">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {locationName || 'Siliguri'}
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight leading-none shadow-sm">
                            {hotel.name}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="p-8 pb-10 flex items-center justify-between">
                <div className="space-y-1">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block leading-none">Starting Price</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-neutral-900 dark:text-white italic-none">₹{hotel.price.toLocaleString()}</span>
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">/Room</span>
                    </div>
                </div>

                <div className="px-6 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 text-xs font-bold uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-600/10">
                    Book Now
                </div>
            </div>
        </Link>
    );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building2, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Property, Location } from '@/lib/services';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
    property: Property;
    locationName?: string;
    className?: string;
}

export function PropertyCard({ property, locationName, className }: PropertyCardProps) {
    return (
        <Link
            href={`/properties/${property.id}`}
            className={cn(
                "group block bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500",
                className
            )}
        >
            <div className="relative h-52 overflow-hidden">
                <Image
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1587061949733-7623942dc5c5?auto=format&fit=crop&q=80&w=800'}
                    alt={property.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent opacity-60" />

                {/* Top Left: Category */}
                <div className="absolute top-6 left-6">
                    <div className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-xl backdrop-blur-md",
                        property.category === 'Luxury' ? 'bg-purple-600' :
                            property.category === 'Premium' ? 'bg-amber-500' :
                                'bg-blue-600'
                    )}>
                        {property.category}
                    </div>
                </div>

                {/* Top Right: Offer & Discount (Single Line) */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    {(property.discount_label || (property.discount_percent !== undefined && property.discount_percent > 0)) && (
                        <div className="px-3 py-2 rounded-2xl bg-red-600 text-white shadow-2xl flex items-center gap-2 animate-in slide-in-from-right duration-500">
                            {property.discount_label && (
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{property.discount_label}</span>
                                </div>
                            )}
                            {property.discount_label && property.discount_percent !== undefined && property.discount_percent > 0 && (
                                <div className="w-px h-3 bg-white/30" />
                            )}
                            {property.discount_percent !== undefined && property.discount_percent > 0 && (
                                <span className="text-xs font-bold tracking-tight">{property.discount_percent}% OFF</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-6">
                    <div className="px-3 py-1 rounded-full bg-primary-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest">
                        3 Meal Included
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.15em]">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        {locationName || 'Hill Station'}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-primary-600 transition-colors">
                        {property.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-50 dark:border-white/5">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                            {property.discount_percent !== undefined && property.discount_percent > 0 ? (
                                <>
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white italic-none">₹{Math.round(property.price * (1 - property.discount_percent / 100))}</span>
                                    <span className="text-[10px] text-neutral-400 line-through">₹{property.price}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white italic-none">₹{property.price}</span>
                            )}
                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">/night</span>
                        </div>
                        <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wide">Per Person</span>
                    </div>
                    <div className="px-5 py-2 rounded-2xl bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500 transition-all duration-500 shadow-lg shadow-primary-600/20">
                        Book Now
                    </div>
                </div>
            </div>
        </Link>
    );
}

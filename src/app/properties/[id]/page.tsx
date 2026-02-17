"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ChevronLeft, ChevronRight, MapPin, Users,
    Wifi, Car, Mountain, Utensils, Flame,
    Droplets, Info, Star, ShieldCheck, ArrowLeft,
    CheckCircle2, Building2, Sparkles
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { homestayService, Property, Location } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { BookingFlow } from '@/components/BookingFlow';

const AMENITY_ICONS: Record<string, any> = {
    'High-Speed Wi-Fi': Wifi,
    'Secure Parking': Car,
    'Mountain Views': Mountain,
    'In-House Dining': Utensils,
    'Room Heaters': Flame,
    '24/7 Geyser': Droplets,
    'Bonfire & BBQ': Flame,
    'Local Guide': Users,
};

export default function PropertyDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const props = await homestayService.getProperties();
            const found = props.find(p => p.id === id);
            if (found) {
                setProperty(found);
                const [locs, roomData] = await Promise.all([
                    homestayService.getLocations(),
                    homestayService.getRoomsByProperty(found.id)
                ]);
                const loc = locs.find(l => l.id === found.location_id);
                setLocation(loc || null);
                setRooms(roomData || []);
            }
        } catch (error) {
            console.error('Error loading property:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Preparing your stay...</p>
            </div>
        </div>
    );

    if (!property) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-50 dark:bg-neutral-900">
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Property Not Found</h1>
            <Button onClick={() => router.back()}>Return to Explore</Button>
        </div>
    );

    const hasDiscount = property.discount_percent !== undefined && property.discount_percent > 0;

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
            <div className="pt-28 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-all font-bold group mb-8"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-widest">Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Visuals */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Compact Gallery/Carousel */}
                        <div className="relative h-[45vh] lg:h-[60vh] rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-2xl group">
                            <div className="overflow-hidden h-full" ref={emblaRef}>
                                <div className="flex h-full">
                                    {(property.images?.length ? property.images : [null]).map((img, idx) => (
                                        <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                                            <Image
                                                src={img || 'https://images.unsplash.com/photo-1587061949733-7623942dc5c5?auto=format&fit=crop&q=80&w=1200'}
                                                alt={`${property.name} - ${idx + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                priority={idx === 0}
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Refined Navigation */}
                            <div className="absolute inset-x-6 bottom-6 flex justify-between items-center pointer-events-none transition-all duration-300">
                                <button
                                    onClick={() => emblaApi?.scrollPrev()}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-90"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex gap-1.5 pointer-events-auto">
                                    {property.images?.map((_, idx) => (
                                        <div key={idx} className={cn("h-1 rounded-full transition-all", selectedIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/40")} />
                                    ))}
                                </div>
                                <button
                                    onClick={() => emblaApi?.scrollNext()}
                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-90"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-3">
                                <div className="px-4 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest shadow-xl">
                                    3 Meal Included
                                </div>

                                {(property.discount_label || (property.discount_percent !== undefined && property.discount_percent > 0)) && (
                                    <div className="bg-red-600 text-white px-5 py-3 rounded-[2rem] shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500">
                                        {property.discount_label && (
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 fill-white text-white" />
                                                <span className="text-[11px] font-black uppercase tracking-widest leading-none">{property.discount_label}</span>
                                            </div>
                                        )}
                                        {property.discount_label && property.discount_percent !== undefined && property.discount_percent > 0 && (
                                            <div className="w-px h-4 bg-white/30" />
                                        )}
                                        {property.discount_percent !== undefined && property.discount_percent > 0 && (
                                            <div className="flex flex-col items-center leading-none">
                                                <span className="text-sm font-black">{property.discount_percent}% OFF</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {property.images && property.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {property.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => emblaApi?.scrollTo(idx)}
                                        className={cn(
                                            "relative flex-[0_0_100px] h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                                            selectedIndex === idx
                                                ? "border-primary-500 ring-4 ring-primary-500/10 scale-95"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Amenities: Refined Chip Style */}
                        <div className="space-y-4">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.25em] pl-1">Property Features</div>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities?.map((amenity) => {
                                    const Icon = AMENITY_ICONS[amenity] || CheckCircle2;
                                    return (
                                        <div
                                            key={amenity}
                                            className="group relative flex items-center gap-2 px-3.5 py-2 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-white/10 rounded-full hover:border-primary-500/40 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200"
                                        >
                                            <Icon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-[0.08em]">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest">
                                <Info className="w-4 h-4" /> About this property
                            </div>
                            {(() => {
                                let sections = [];
                                try {
                                    sections = property.description ? JSON.parse(property.description) : [];
                                    if (!Array.isArray(sections)) throw new Error('Not an array');
                                } catch (e) {
                                    sections = property.description ? [{ title: '', content: property.description }] : [];
                                }

                                if (sections.length === 0) return null;

                                return (
                                    <div className="space-y-6">
                                        {sections.map((section: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                {section.title && <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{section.title}</h3>}
                                                <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed whitespace-pre-wrap">
                                                    {section.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Right Column: Key Details & Booking */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-neutral-500 font-bold text-[11px] uppercase tracking-[0.2em] bg-neutral-100 dark:bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-neutral-200/50 dark:border-white/5">
                                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                                {location?.name}, {location?.state}
                            </div>
                            <div className="flex items-start justify-between gap-4 text-left">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-none italic-none">
                                    {property.name}
                                </h1>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={cn(
                                        "flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none",
                                        property.category === 'Luxury' ? 'bg-purple-500 text-white' :
                                            property.category === 'Premium' ? 'bg-amber-500 text-white' :
                                                'bg-blue-600 text-white'
                                    )}>
                                        {property.category}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Booking Card */}
                        <div className="relative p-8 bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-900/50 border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-2xl shadow-neutral-900/5 dark:shadow-black/20 space-y-6 sticky top-24 overflow-hidden">
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb,14,165,233),0.03),transparent_50%)] pointer-events-none" />

                            <div className="relative space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">Base Rate</div>
                                        <div className="flex items-baseline gap-2.5">
                                            {property.discount_percent !== undefined && property.discount_percent > 0 ? (
                                                <>
                                                    <span className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">₹{Math.round(property.price * (1 - property.discount_percent / 100))}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-neutral-400 line-through decoration-red-500/40">₹{property.price}</span>
                                                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">/night/person</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">₹{property.price}</span>
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest self-end pb-1.5">/night/person</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl ring-1 ring-emerald-500/20">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent" />

                                <Button
                                    size="lg"
                                    onClick={() => setIsBookingOpen(true)}
                                    className="w-full rounded-2xl h-14 shadow-xl shadow-primary-600/20 hover:shadow-2xl hover:shadow-primary-600/30 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Reserve This Stay
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-center">
                                    <div className="h-px w-8 bg-neutral-200 dark:bg-white/10" />
                                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] whitespace-nowrap">
                                        Free cancellation • No hidden fees
                                    </p>
                                    <div className="h-px w-8 bg-neutral-200 dark:bg-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Navbar - Re-optimized */}
            <div className="fixed bottom-6 inset-x-6 z-[60] lg:hidden">
                <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-3xl">
                    <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-primary-500 uppercase tracking-widest">Starts from</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white italic-none">₹{property.discount_percent && property.discount_percent > 0 ? Math.round(property.price * (1 - property.discount_percent / 100)) : property.price}</span>
                            {property.discount_percent !== undefined && property.discount_percent > 0 && <span className="text-xs text-neutral-500 line-through">₹{property.price}</span>}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsBookingOpen(true)}
                        className="rounded-xl px-10 h-12 shadow-xl shadow-primary-600/40 font-bold text-[11px] uppercase tracking-widest"
                    >
                        Reserve This Stay
                    </Button>
                </div>
            </div>

            {
                isBookingOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
                            <BookingFlow property={property} rooms={rooms} onClose={() => setIsBookingOpen(false)} />
                        </div>
                    </div>
                )
            }
        </main >
    );
}


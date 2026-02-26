'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ChevronLeft, ChevronRight, MapPin, Users,
    Wifi, Car, Mountain, Utensils, Flame,
    Droplets, Info, Star, ShieldCheck, ArrowLeft,
    CheckCircle2, Building2, Sparkles, BedDouble
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { homestayService, Hotel, Location, HotelRoom } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { HotelBookingFlow } from '@/components/HotelBookingFlow';
import { RoomCarousel } from '@/components/RoomCarousel';

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

export default function HotelDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [rooms, setRooms] = useState<HotelRoom[]>([]);
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
            const hotelData = await homestayService.getHotelById(id as string);
            if (hotelData) {
                setHotel(hotelData);
                setLocation(hotelData.locations);
                const roomData = await homestayService.getRoomsByHotel(hotelData.id);
                setRooms(roomData || []);
            }
        } catch (error) {
            console.error('Error loading hotel:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Opening the Lobby...</p>
            </div>
        </div>
    );

    if (!hotel) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-50 dark:bg-neutral-900">
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Hotel Not Found</h1>
            <Button onClick={() => router.back()}>Return to Explore</Button>
        </div>
    );

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-12">
            <div className="pt-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-all font-bold group mb-6"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-widest">Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                    {/* Left Column: Visuals */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Hero Gallery */}
                        <div className="relative h-[35vh] lg:h-[50vh] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-2xl group">
                            <div className="overflow-hidden h-full" ref={emblaRef}>
                                <div className="flex h-full">
                                    {(hotel.images?.length ? hotel.images : [null]).map((img, idx) => (
                                        <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-full">
                                            <Image
                                                src={img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'}
                                                alt={`${hotel.name} - ${idx + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                priority={idx === 0}
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="absolute inset-x-8 bottom-8 flex justify-between items-center z-10">
                                <button
                                    onClick={() => emblaApi?.scrollPrev()}
                                    className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white flex items-center justify-center transition-all active:scale-90"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex gap-2">
                                    {hotel.images?.map((_, idx) => (
                                        <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-500", selectedIndex === idx ? "w-8 bg-white" : "w-1.5 bg-white/40")} />
                                    ))}
                                </div>
                                <button
                                    onClick={() => emblaApi?.scrollNext()}
                                    className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white flex items-center justify-center transition-all active:scale-90"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="absolute top-8 left-8 z-10">
                                <div className="px-4 py-2 rounded-2xl bg-amber-500/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-white" />
                                    {hotel.category} Collection
                                </div>
                            </div>
                        </div>

                        {/* Room Types Display */}
                        <div className="space-y-4">
                            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em] pl-1">Experience Our Hospitality</div>
                            <RoomCarousel rooms={rooms} />
                        </div>

                    </div>

                    {/* Right Column: Reservation Sidebar */}
                    <div className="lg:col-span-5 space-y-4 lg:space-y-6">
                        <div className="space-y-3 lg:space-y-4 lg:pl-4">
                            <div className="flex items-center gap-2 text-neutral-400 font-black text-[11px] uppercase tracking-[0.25em] bg-white dark:bg-neutral-900 w-fit px-4 py-2 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                {location?.name}, {location?.state}
                            </div>
                            <h1 className="text-2xl lg:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase leading-none italic-none">
                                {hotel.name}
                            </h1>
                        </div>

                        <div className="sticky top-28 lg:pl-4">
                            <div className="relative p-5 lg:p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-neutral-900/5 space-y-4 lg:space-y-5 overflow-hidden">
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="p-2.5 bg-primary-500/10 text-primary-600 rounded-2xl ring-1 ring-primary-500/20">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-0.5 lg:space-y-1">
                                    <span className="text-[9px] lg:text-[10px] font-black text-neutral-400 uppercase tracking-widest">Starting from</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter italic-none">₹{hotel.price.toLocaleString()}</span>
                                        <span className="text-[9px] lg:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">/night</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {hotel.amenities?.slice(0, 4).map(amenity => (
                                            <div key={amenity} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-full border border-neutral-100 dark:border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-neutral-50 dark:bg-white/5" />

                                <div className="space-y-3">
                                    <Button
                                        size="lg"
                                        onClick={() => setIsBookingOpen(true)}
                                        className="w-full rounded-[2rem] py-6 shadow-2xl shadow-primary-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Initiate Booking
                                    </Button>
                                    <p className="text-[9px] text-center font-bold text-neutral-400 uppercase tracking-widest">
                                        Instant confirmation • Zero booking fee
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description - Moved to the end of the content column */}
                <div className="mt-12 space-y-6 bg-white dark:bg-neutral-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 font-black text-sm uppercase tracking-widest">
                        <Info className="w-5 h-5" /> Detailed Overview
                    </div>
                    {(() => {
                        let sections = [];
                        try {
                            sections = hotel.description ? JSON.parse(hotel.description) : [];
                            if (!Array.isArray(sections)) throw new Error('Not an array');
                        } catch (e) {
                            sections = hotel.description ? [{ title: '', content: hotel.description }] : [];
                        }

                        if (sections.length === 0) return null;

                        return (
                            <div className="space-y-6">
                                {sections.map((section: any, idx: number) => (
                                    <div key={idx} className="space-y-2">
                                        {section.title && <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{section.title}</h3>}
                                        <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed whitespace-pre-wrap">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {isBookingOpen && (
                <HotelBookingFlow
                    hotel={hotel}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
            {/* Sticky Mobile Navbar */}
            <div className="fixed bottom-6 inset-x-6 z-[60] lg:hidden">
                <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center justify-between shadow-2xl shadow-black/50">
                    <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Starts from
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-white italic-none">
                                ₹{hotel.price.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsBookingOpen(true)}
                        className="rounded-xl px-6 h-12 shadow-xl shadow-primary-600/20 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Reserve This Stay
                    </Button>
                </div>
            </div>
        </main>
    );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users, Search, Loader2 } from "lucide-react";
import { homestayService, Location } from "@/lib/services";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2000",
        title: "Escape to Nature's Embrace",
        subtitle: "Experience luxury homestays in the heart of the mountains.",
        location: "Manali, Himachal Pradesh",
    },
    {
        image: "https://images.unsplash.com/photo-1587061949733-7623942dc5c5?auto=format&fit=crop&q=80&w=2000",
        title: "Serenity by the Shore",
        subtitle: "Modern villas with breathtaking ocean views.",
        location: "Goa, India",
    },
];

export function Hero() {
    const router = useRouter();

    // Search State
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [locationId, setLocationId] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const fetchedLocations = await homestayService.getLocations();
                setLocations(fetchedLocations);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setIsLoadingLocations(false);
            }
        };
        fetchLocations();
    }, []);


    const handleSearch = () => {
        if (!checkIn || !checkOut) return;
        const query = new URLSearchParams({
            checkin: checkIn,
            checkout: checkOut,
        });
        if (locationId) query.append('location', locationId);
        router.push(`/properties?${query.toString()}`);
    };

    return (
        <section className="relative h-[75vh] md:h-[90vh] w-full overflow-hidden bg-neutral-900 mt-0">
            <div className="h-full">
                {(() => {
                    const slide = HERO_SLIDES[0];
                    return (
                        <div className="relative h-full w-full">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover opacity-60 animate-slow-pan"
                                priority
                            />
                            {/* Improved overlay for better text contrast and depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20 pb-48 md:pt-0 md:pb-32">
                                <div className="animate-fade-in space-y-2 max-w-5xl">
                                    {/* Redesigned Title - Mobile Optimized & Smaller */}
                                    <h1 className="text-[2.75rem] sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] drop-shadow-2xl mt-2 md:mt-4">
                                        {slide.title.split(' ').map((word, i) => (
                                            <span key={i} className="inline-block hover:text-primary-400 transition-colors duration-500 cursor-default mr-1.5 md:mr-3">
                                                {word}
                                            </span>
                                        ))}
                                    </h1>

                                    {/* Redesigned Subtitle - Mobile Optimized & Smaller */}
                                    <p className="text-sm sm:text-base md:text-xl text-neutral-200/90 max-w-xl md:max-w-2xl mx-auto leading-relaxed font-semibold tracking-tight drop-shadow-md px-4">
                                        {slide.subtitle}
                                    </p>

                                    {/* Redesigned Buttons - Contact Us Green */}
                                    <div className="pt-6 flex flex-row justify-center gap-3 md:gap-4 items-center w-full max-w-[320px] mx-auto sm:max-w-none sm:px-0">
                                        <Button
                                            size="md"
                                            className="flex-1 sm:flex-none sm:w-auto rounded-full px-5 sm:px-8 py-3 sm:py-4 h-auto text-[11px] sm:text-sm font-black uppercase tracking-widest bg-white text-neutral-900 hover:bg-neutral-100 hover:scale-105 transition-all duration-300 shadow-2xl shadow-white/5 border-0"
                                        >
                                            Explore
                                        </Button>
                                        <Button
                                            size="md"
                                            className="flex-1 sm:flex-none sm:w-auto rounded-full px-5 sm:px-8 py-3 sm:py-4 h-auto text-[11px] sm:text-sm font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-500 hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary-600/20 border-0"
                                        >
                                            Contact
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Search Bar - Positioned at bottom overlapping content */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 md:pb-12 flex justify-center">
                <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-4xl w-full">
                    <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2">
                        {/* Dates Row on Mobile */}
                        <div className="flex flex-row items-center gap-1.5 md:gap-2 w-full md:flex-1">
                            {/* Check In */}
                            <div className="flex-1 relative group">
                                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-primary-400 transition-colors">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                </div>
                                <div className="absolute left-8 md:left-10 top-1.5 md:top-2 text-[8px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest">Check In</div>
                                <input
                                    type="date"
                                    className="w-full bg-black/20 text-white pl-8 md:pl-10 pr-2 md:pr-4 pt-5 pb-1 md:pt-6 md:pb-2 rounded-2xl md:rounded-3xl border-transparent focus:bg-black/40 focus:ring-0 transition-all outline-none font-medium h-12 md:h-16 text-xs md:text-base [&::-webkit-calendar-picker-indicator]:invert"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </div>

                            {/* Check Out */}
                            <div className="flex-1 relative group">
                                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-primary-400 transition-colors">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                </div>
                                <div className="absolute left-8 md:left-10 top-1.5 md:top-2 text-[8px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest">Check Out</div>
                                <input
                                    type="date"
                                    className="w-full bg-black/20 text-white pl-8 md:pl-10 pr-2 md:pr-4 pt-5 pb-1 md:pt-6 md:pb-2 rounded-2xl md:rounded-3xl border-transparent focus:bg-black/40 focus:ring-0 transition-all outline-none font-medium h-12 md:h-16 text-xs md:text-base [&::-webkit-calendar-picker-indicator]:invert"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Place/Location */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-primary-400 transition-colors">
                                {isLoadingLocations ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            </div>
                            <div className="absolute left-10 top-1.5 md:top-2 text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest">Place</div>
                            <select
                                className="w-full bg-black/20 text-white pl-10 pr-10 pt-5 pb-1 md:pt-6 md:pb-2 rounded-3xl border-transparent focus:bg-black/40 focus:ring-0 transition-all outline-none font-medium h-12 md:h-16 appearance-none cursor-pointer"
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                disabled={isLoadingLocations}
                            >
                                <option value="" className="text-black">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id} className="text-black">{loc.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            className="w-full md:w-auto h-10 md:h-12 px-6 rounded-xl md:rounded-2xl bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-xs"
                        >
                            <Search className="w-4 h-4" />
                            <span className="md:hidden">Search</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

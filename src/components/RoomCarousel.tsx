"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, BedDouble } from "lucide-react";
import { HotelRoom } from "@/lib/services";
import { cn } from "@/lib/utils";

interface RoomCarouselProps {
    rooms: HotelRoom[];
}

export function RoomCarousel({ rooms }: RoomCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        containScroll: "trimSnaps",
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 }
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative group/carousel">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="flex-[0_0_100%] md:flex-[0_0_50%] pl-6 py-4">
                            <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm space-y-4 group/card hover:border-primary-500/40 transition-all h-full">
                                <div className="flex items-center gap-2 text-primary-500">
                                    <BedDouble className="w-5 h-5" />
                                    <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none italic-none">
                                        {room.type}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-4 pt-3 border-t border-neutral-50 dark:border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">1 Guest</span>
                                        <span className="text-base font-black text-neutral-900 dark:text-white leading-none italic-none">₹{room.price_one_guest.toLocaleString()}</span>
                                        <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-tight leading-tight">pp.pn</span>
                                    </div>
                                    <div className="w-px h-10 bg-neutral-100 dark:bg-white/5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">2 Guests</span>
                                        <span className="text-base font-black text-neutral-900 dark:text-white leading-none italic-none">₹{room.price_two_guests.toLocaleString()}</span>
                                        <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-tight leading-tight">pp.pn</span>
                                    </div>
                                    <div className="w-px h-10 bg-neutral-100 dark:bg-white/5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">3+ Guests</span>
                                        <span className="text-base font-black text-neutral-900 dark:text-white leading-none italic-none">₹{room.price_three_plus_guests.toLocaleString()}</span>
                                        <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-tight leading-tight">pp.pn</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation & Controls Section */}
            {rooms.length > 2 && (
                <div className="flex items-center justify-between mt-8">
                    {/* Pagination Dots */}
                    <div className="flex gap-2.5">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                    selectedIndex === index
                                        ? "bg-primary-500 w-8"
                                        : "bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90",
                                prevBtnEnabled
                                    ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm"
                                    : "opacity-30 cursor-not-allowed"
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90",
                                nextBtnEnabled
                                    ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm"
                                    : "opacity-30 cursor-not-allowed"
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

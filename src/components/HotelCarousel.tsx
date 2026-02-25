"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Hotel, Location } from "@/lib/services";
import { cn } from "@/lib/utils";
import { HotelCard } from "./HotelCard";

interface HotelCarouselProps {
    hotels: Hotel[];
    locations: Location[];
}

export function HotelCarousel({ hotels, locations }: HotelCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        containScroll: "trimSnaps",
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4 }
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
                <div className="flex -ml-4 lg:-ml-8">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 lg:pl-8 py-4">
                            <HotelCard
                                hotel={hotel}
                                locationName={locations.find(l => l.id === hotel.location_id)?.name}
                                className="h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation & Controls Section */}
            {hotels.length > 4 && (
                <div className="flex flex-col items-center gap-4 mt-8">
                    {/* Navigation Buttons - Hidden on mobile, flex on desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-sm",
                                prevBtnEnabled
                                    ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-primary-500 hover:border-primary-500 hover:text-white"
                                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-200 dark:text-neutral-800 cursor-not-allowed"
                            )}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-sm",
                                nextBtnEnabled
                                    ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-primary-500 hover:border-primary-500 hover:text-white"
                                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-white/5 text-neutral-200 dark:text-neutral-800 cursor-not-allowed"
                            )}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center flex-wrap gap-2.5">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300 border-2",
                                    selectedIndex === index
                                        ? "bg-primary-500 border-primary-500 w-10"
                                        : "bg-neutral-200 dark:bg-neutral-800 border-transparent hover:bg-neutral-300 dark:hover:bg-neutral-700"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

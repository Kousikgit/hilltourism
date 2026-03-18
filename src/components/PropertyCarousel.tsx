"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Building2, ArrowRight } from "lucide-react";
import { Property, Location } from "@/lib/services";
import { cn } from "@/lib/utils";
import { PropertyCard } from "./PropertyCard";

interface PropertyCarouselProps {
    properties: Property[];
    locations: Location[];
    viewAllLink?: string;
    viewAllLabel?: string;
}

export function PropertyCarousel({ properties, locations, viewAllLink, viewAllLabel }: PropertyCarouselProps) {
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
                    {properties.map((property) => (
                        <div key={property.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 lg:pl-8 py-4">
                            <PropertyCard
                                property={property}
                                locationName={locations.find(l => l.id === property.location_id)?.name}
                                className="h-full"
                            />
                        </div>
                    ))}

                    {/* "View All" Card */}
                    {viewAllLink && (
                        <div className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 lg:pl-8 py-4">
                            <Link
                                href={viewAllLink}
                                className="group relative bg-gradient-to-br from-primary-600 to-orange-500 rounded-3xl overflow-hidden shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer block h-full text-white"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                <div className="relative h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6">
                                    <div className="p-6 bg-white/20 backdrop-blur-xl rounded-full ring-4 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic-none">
                                            Explore <br /> All <span className="text-white/80">Stays</span>
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                                            {viewAllLabel || 'AUTHENTIC HIMALAYAN HOMESTAYS'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                                        View All Properties <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation & Controls Section */}
            {(properties.length > 4 || (properties.length > 3 && viewAllLink)) && (
                <div className="flex flex-col items-center gap-4 mt-8">
                    {/* Navigation Buttons */}
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

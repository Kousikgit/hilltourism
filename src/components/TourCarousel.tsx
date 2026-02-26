"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, MapPin, Compass } from "lucide-react";
import { Tour } from "@/lib/services";
import { cn } from "@/lib/utils";

interface TourCarouselProps {
    tours: Tour[];
}

export function TourCarousel({ tours }: TourCarouselProps) {
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
                    {tours.map((tour) => (
                        <div key={tour.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 lg:pl-8 py-2 sm:py-4">
                            <Link
                                href={`/tours/${tour.id}`}
                                className="group relative bg-neutral-50 dark:bg-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-100 dark:border-white/5 hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 cursor-pointer block h-full"
                            >
                                <div className="relative h-64 sm:h-80 overflow-hidden">
                                    {tour.images[0] ? (
                                        <Image
                                            src={tour.images[0]}
                                            alt={tour.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                            <Compass className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-transparent to-transparent opacity-80" />

                                    <div className={cn(
                                        "absolute top-4 right-4 px-3 py-1 backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/40 scale-110"
                                    )}>
                                        {tour.duration}
                                    </div>

                                    <div className="absolute bottom-0 inset-x-0 p-5">
                                        <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                            <MapPin className="w-3 h-3 text-primary-500" />
                                            {tour.locations[0] || 'Multiple Locations'}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary-400 transition-colors truncate uppercase leading-tight tracking-tighter">
                                            {tour.name}
                                        </h3>
                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest font-black">
                                                    {tour.difficulty}
                                                </span>
                                                {(tour.category === "Domestic Tour" || tour.category === "Religious Tour") && (
                                                    <span className="text-base font-black text-white tracking-tighter mt-0.5">
                                                        ₹{tour.price}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">
                                                Book Now
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation & Controls Section */}
            {tours.length > 4 && (
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

                    {/* Pagination Dots (Radio Style) */}
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

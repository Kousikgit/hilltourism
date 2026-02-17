"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
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
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-neutral-900 mt-0">
            <div className="h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {HERO_SLIDES.map((slide, index) => (
                        <div key={index} className="relative flex-[0_0_100%] h-full min-w-0">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover opacity-60 animate-slow-pan"
                                priority={index === 0}
                            />
                            {/* Improved overlay for better text contrast and depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <div className="animate-fade-in space-y-6 max-w-4xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-white/90 text-sm font-medium">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        {slide.location}
                                    </div>
                                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic shadow-2xl drop-shadow-2xl leading-[1.1]">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                                        {slide.subtitle}
                                    </p>
                                    <div className="pt-8 flex flex-wrap justify-center gap-4">
                                        <Button size="lg" className="rounded-full px-12 py-7 h-auto text-lg font-bold shadow-2xl shadow-primary-600/20">Explore Stays</Button>
                                        <Button variant="glass" size="lg" className="rounded-full px-12 py-7 h-auto text-lg font-bold text-white">How it Works</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-10 left-10 flex gap-4 z-10">
                <Button
                    variant="glass"
                    size="sm"
                    onClick={scrollPrev}
                    className="p-3 text-white rounded-full border-white/20"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                    variant="glass"
                    size="sm"
                    onClick={scrollNext}
                    className="p-3 text-white rounded-full border-white/20"
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-12 right-10 flex gap-2 z-10">
                {HERO_SLIDES.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-1.5 transition-all duration-300 rounded-full bg-white",
                            selectedIndex === index ? "w-8 opacity-100" : "w-2 opacity-30"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}

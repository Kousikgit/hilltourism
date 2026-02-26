"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/Button";
import { MapPin, Mountain, ArrowRight, Loader2 } from "lucide-react";
import { homestayService, Tour } from "@/lib/services";
import { cn } from "@/lib/utils";
import { TourCarousel } from "./TourCarousel";

interface PopularToursProps {
    hideHeader?: boolean;
}

export function PopularTours({ hideHeader = false }: PopularToursProps) {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const data = await homestayService.getTours();
                setTours(data);
            } catch (error) {
                console.error('Error fetching tours:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const categories = [
        { title: "Domestic Tour", badge: "Explore India" },
        { title: "International Tour", badge: "Global Destinations" },
        { title: "Adventure Tour", badge: "Thrill Seekers" },
        { title: "Educational Tour", badge: "Learning Journeys" },
        { title: "Religious Tour", badge: "Spiritual Path" },
    ];

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-neutral-900">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">Preparing Expeditions...</p>
            </div>
        );
    }

    if (!tours.length) return null;

    return (
        <section id="popular-tours" className={cn("relative px-4 bg-stone-50/50 dark:bg-neutral-900/50 overflow-hidden", hideHeader ? "py-8" : "py-16")}>
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {!hideHeader && (
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                                <Mountain className="w-3 h-3" />
                                Curated Expeditions
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                                Popular <span className="text-primary-600 dark:text-primary-500">Tours</span>
                            </h2>
                            <p className="text-neutral-500 max-w-xl text-lg">
                                From local trails to global wonders, discover your next big adventure with our expert-led tours.
                            </p>
                        </div>
                    </div>
                )}

                {categories.map((cat) => {
                    const catTours = tours.filter(t => t.category === cat.title);
                    if (catTours.length === 0) return null;

                    return (
                        <div key={cat.title} className="space-y-12">
                            <div className="flex items-center gap-6">
                                <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter shrink-0 italic-none">
                                    {cat.title}
                                </h3>
                                <div className="h-px bg-neutral-200 dark:bg-white/10 w-full" />
                                <div className="shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                    {cat.badge}
                                </div>
                            </div>

                            <TourCarousel tours={catTours} />
                        </div>
                    );
                })}

                <div className="pt-8 text-center px-4">
                    <Link href="/tours" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm hover:gap-3 transition-all group border border-primary-600/20 px-6 py-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/10">
                        Discover All Adventures
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

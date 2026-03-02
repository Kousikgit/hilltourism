"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/Button";
import { MapPin, Mountain, ArrowRight, Loader2, Sparkles, BookOpen, Compass, History, Globe, ChevronDown } from "lucide-react";
import { homestayService, Tour } from "@/lib/services";
import { cn } from "@/lib/utils";
import { TourCarousel } from "./TourCarousel";

interface PopularToursProps {
    hideHeader?: boolean;
}

export function PopularTours({ hideHeader = false }: PopularToursProps) {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('all');

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
        { id: 'all', title: "All Tours", badge: "All Categories", icon: Sparkles },
        { id: 'Domestic Tour', title: "Domestic Tour", badge: "Explore India", icon: MapPin },
        { id: 'International Tour', title: "International Tour", badge: "Global Destinations", icon: Globe },
        { id: 'Adventure Tour', title: "Adventure Tour", badge: "Thrill Seekers", icon: Mountain },
        { id: 'Educational Tour', title: "Educational Tour", badge: "Learning Journeys", icon: BookOpen },
        { id: 'Religious Tour', title: "Religious Tour", badge: "Spiritual Path", icon: History },
    ];

    const activeCatData = categories.find(c => c.id === activeCategory) || categories[0];
    const filteredTours = activeCategory === 'all'
        ? tours
        : tours.filter(t => t.category === activeCatData.title);

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
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4 md:mb-8">
                    {!hideHeader && (
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
                    )}
                </div>

                {/* Mobile Category Dropdown */}
                <div className="md:hidden relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        {(() => {
                            const Icon = activeCatData.icon;
                            return <Icon className="w-5 h-5" />;
                        })()}
                    </div>
                    <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm text-neutral-900 dark:text-white"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="text-neutral-900">
                                {cat.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {/* Desktop Category Buttons */}
                <div className="hidden md:flex flex-wrap gap-3">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? 'primary' : 'glass'}
                                size="sm"
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "rounded-full px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2",
                                    cat.id === activeCategory && "shadow-lg shadow-primary-600/20",
                                    cat.id !== activeCategory && "hover:bg-primary-50 dark:hover:bg-primary-900/10"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.title}
                            </Button>
                        );
                    })}
                </div>

                {/* Render the Active Carousel */}
                <div className="space-y-6 pt-2 md:pt-6">
                    {activeCategory !== 'all' && filteredTours.length > 0 && (
                        <div className="flex items-center gap-6 mb-8">
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter shrink-0 italic-none">
                                {activeCatData.title}
                            </h3>
                            <div className="h-px bg-neutral-200 dark:bg-white/10 w-full" />
                            <div className="shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                {activeCatData.badge}
                            </div>
                        </div>
                    )}

                    {filteredTours.length > 0 ? (
                        <TourCarousel key={activeCategory} tours={filteredTours} />
                    ) : (
                        <div className="py-20 text-center bg-white/50 dark:bg-neutral-800/50 rounded-[3rem] border border-dashed border-neutral-200 dark:border-white/10">
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">No tours found in this category yet.</p>
                        </div>
                    )}
                </div>

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

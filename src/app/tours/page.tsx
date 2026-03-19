"use client";

import { PopularTours } from "@/components/PopularTours";
import { Compass } from "lucide-react";

export default function ToursListingPage() {
    return (
        <div className="pt-32 min-h-screen bg-stone-50 dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-0">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-4">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <h1 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic-none leading-none">
                            All <span className="text-primary-500">Expeditions</span>
                        </h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm md:text-base font-medium text-center md:text-right">
                        Explore our complete catalog of curated trails. From major domestic circuits to offbeat spiritual journeys.
                    </p>
                </div>

                <div className="h-px bg-neutral-200 dark:bg-white/5 w-full mb-4" />
            </div>

            <PopularTours hideHeader={true} />
        </div>
    );
}

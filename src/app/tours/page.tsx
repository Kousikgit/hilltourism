"use client";

import { PopularTours } from "@/components/PopularTours";
import { Compass } from "lucide-react";

export default function ToursListingPage() {
    return (
        <div className="pt-24 min-h-screen bg-stone-50 dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col items-center text-center space-y-4 mb-16">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] text-emerald-500">
                        <Compass className="w-12 h-12" />
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">
                        All <span className="text-emerald-500">Expeditions</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-lg font-medium">
                        Explore our complete catalog of domestic, international, adventure, and spiritual journeys. Every trail is curated for the ultimate experience.
                    </p>
                </div>
            </div>

            <PopularTours />
        </div>
    );
}

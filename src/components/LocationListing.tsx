'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, MapPin, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { homestayService, Location, Property } from '@/lib/services';
import { cn } from '@/lib/utils';
import { PropertyCard } from './PropertyCard';

export function LocationListing() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [locations, setLocations] = useState<Location[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [locs, props] = await Promise.all([
                homestayService.getLocations(),
                homestayService.getProperties(undefined)
            ]);
            setLocations(locs);
            setProperties(props);
        } catch (error) {
            console.error('Error loading listing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = activeCategory === 'all'
        ? properties.slice(0, 3)
        : properties.filter(p => p.location_id === activeCategory).slice(0, 3);

    const categories = [
        { id: 'all', name: 'Newly Listed' },
        ...locations
    ];

    return (
        <section className="relative py-16 px-4 overflow-hidden bg-white dark:bg-neutral-900">
            {/* Background elements to break monotony */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 dark:from-primary-900/10 dark:via-neutral-900 dark:to-primary-900/5" />
            <div className="absolute inset-0 bg-dot-pattern text-neutral-900/[0.03] dark:text-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                            Explore Destinations
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            Browse by <span className="text-primary-600 dark:text-primary-400">Location</span>
                        </h2>
                    </div>
                </div>

                {/* Mobile Location Dropdown */}
                <div className="md:hidden mb-8 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <select
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm text-neutral-900 dark:text-white"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="text-neutral-900">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                {/* Desktop Category Buttons */}
                <div className="hidden md:flex flex-wrap gap-3 mb-12">
                    {categories.map((cat) => {
                        const Icon = (cat as any).icon;
                        return (
                            <Button
                                key={cat.id}
                                variant={activeCategory === cat.id ? 'primary' : 'glass'}
                                size="sm"
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "rounded-full px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2",
                                    activeCategory === cat.id ? "shadow-lg shadow-primary-600/20" : "hover:bg-primary-50 dark:hover:bg-primary-900/10"
                                )}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {cat.name}
                            </Button>
                        );
                    })}
                </div>

                {/* Dynamic Property Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Curating Stays...</p>
                        </div>
                    ) : filteredProperties.length > 0 ? (
                        filteredProperties.map((prop) => {
                            const location = locations.find(l => l.id === prop.location_id);
                            return (
                                <PropertyCard
                                    key={prop.id}
                                    property={prop}
                                    locationName={location?.name}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No properties found in this location.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center px-4">
                    <Link href="/properties" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm hover:gap-3 transition-all group border border-primary-600/20 px-6 py-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/10">
                        View all properties <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div >
        </section >
    );
}

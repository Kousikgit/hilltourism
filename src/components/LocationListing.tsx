'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
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

                {/* Category Buttons */}
                <div className="flex flex-wrap gap-3 mb-12">
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

                <div className="mt-16 text-center px-4">
                    <Link
                        href="/properties"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 group bg-primary-600 sm:bg-transparent text-white sm:text-primary-600 dark:text-primary-400 font-bold px-8 py-4 sm:p-0 rounded-2xl sm:rounded-none hover:gap-3 transition-all shadow-lg shadow-primary-600/20 sm:shadow-none"
                    >
                        View all properties <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div >
        </section >
    );
}

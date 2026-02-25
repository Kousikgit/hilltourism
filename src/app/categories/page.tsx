'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Mountain, Waves, Leaf, Loader2, ArrowLeft, History, Compass, Laptop, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { homestayService, Location, Property } from '@/lib/services';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { PropertyCard } from '@/components/PropertyCard';

const CATEGORIES = [
    { id: 'all', name: 'All Stays', icon: Sparkles },
    { id: 'Mountain View', name: 'Mountain View Stays', icon: Mountain },
    { id: 'River Side', name: 'River Side Stays', icon: Waves },
    { id: 'Tea Estate', name: 'Tea Estate Stays', icon: Leaf },
    { id: 'Heritage Stays', name: 'Heritage Stays', icon: History },
    { id: 'Offbeat Stays', name: 'Offbeat Stays', icon: Compass },
    { id: 'Workstation', name: 'Workstation', icon: Laptop },
];

export default function CategoriesPage() {
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
                homestayService.getProperties()
            ]);
            setLocations(locs);
            setProperties(props);
        } catch (error) {
            console.error('Error loading category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = activeCategory === 'all'
        ? properties
        : properties.filter(p => p.stay_category === activeCategory);

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
            {/* Header Section */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-white/5 pt-32 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors font-bold text-[10px] uppercase tracking-[0.2em] mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                                Curated Collections
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic-none leading-none">
                                Category <span className="text-primary-600 dark:text-primary-400">Wise Stays</span>
                            </h1>
                        </div>
                        <p className="max-w-md text-neutral-500 font-medium">
                            Choose your perfect setting. From misty mountain tops to serene river banks and lush tea gardens.
                        </p>
                    </div>

                    {/* Mobile Category Dropdown */}
                    <div className="md:hidden mt-8 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                            {(() => {
                                const activeCat = CATEGORIES.find(c => c.id === activeCategory);
                                const Icon = activeCat?.icon || Sparkles;
                                return <Icon className="w-5 h-5" />;
                            })()}
                        </div>
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm text-neutral-900 dark:text-white"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id} className="text-neutral-900">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Desktop Category Selector */}
                    <div className="hidden md:flex flex-wrap gap-3 mt-12">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? 'primary' : 'glass'}
                                    size="sm"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "rounded-full px-8 py-3 text-sm font-bold transition-all flex items-center gap-2",
                                        cat.id === activeCategory && "shadow-xl shadow-primary-600/20",
                                        cat.id !== activeCategory && "hover:bg-primary-50 dark:hover:bg-primary-900/10"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 mt-16">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Assembling your collection...</p>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((prop) => {
                            const location = locations.find(l => l.id === prop.location_id);
                            return (
                                <PropertyCard
                                    key={prop.id}
                                    property={prop}
                                    locationName={location?.name}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                        <Sparkles className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">No stays yet</h3>
                        <p className="text-neutral-500 font-medium mt-2">We are currently curating the best properties in this category.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

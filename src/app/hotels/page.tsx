'use client';

import { useEffect, useState } from 'react';
import { Building2, Loader2, MapPin, Search } from 'lucide-react';
import { homestayService, Hotel, Location } from '@/lib/services';
import { HotelCard } from '@/components/HotelCard';

export default function HotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelData, locationData] = await Promise.all([
                    homestayService.getHotels(),
                    homestayService.getLocations()
                ]);
                setHotels(hotelData || []);
                setLocations(locationData || []);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-neutral-950">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">Opening the Lobby...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50 dark:bg-neutral-950 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 shadow-xl shadow-primary-500/10">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                            Premium <span className="text-primary-600">Hotels</span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                            Curated comfort and luxury hospitality in the heart of the Himalayas. Discover your perfect urban escape.
                        </p>
                    </div>
                </div>

                {/* Filter Section - Hidden as requested */}
                {/* <div className="max-w-xl mx-auto w-full">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary-500/5 blur-xl group-hover:bg-primary-500/10 transition-all rounded-full" />
                        <div className="relative bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-2 flex items-center border border-neutral-200 dark:border-white/10 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-500/20">
                            <div className="pl-4 text-neutral-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent px-4 py-2.5 outline-none text-neutral-900 dark:text-white font-medium placeholder:text-neutral-400"
                            />
                        </div>
                    </div>
                    {searchTerm && (
                        <p className="text-center mt-3 text-xs font-bold text-neutral-400">
                            Found {filteredHotels.length} match{filteredHotels.length !== 1 && 'es'}
                        </p>
                    )}
                </div> */}

                {/* Listing Grid */}
                {filteredHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHotels.map((hotel) => (
                            <HotelCard
                                key={hotel.id}
                                hotel={hotel}
                                locationName={locations.find(l => l.id === hotel.location_id)?.name}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900">
                            <Search className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No hotels found</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                We couldn't find any hotels matching "{searchTerm}". Try checking for typos or using broader terms.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

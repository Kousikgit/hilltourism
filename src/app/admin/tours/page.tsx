"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Loader2, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { homestayService } from '@/lib/services';
import Image from 'next/image';
import { TourForm } from '@/components/TourForm';
import { useToast } from '@/context/ToastContext';

export default function AdminToursPage() {
    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTour, setEditingTour] = useState<any>(undefined);
    const { success, error } = useToast();

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            const data = await homestayService.getTours();
            setTours(data || []);
        } catch (err) {
            console.error('Error fetching tours:', err);
            error('Failed to load tours');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingTour) {
                await homestayService.updateTour(editingTour.id, data);
                success('Tour updated successfully');
            } else {
                await homestayService.createTour(data);
                success('Tour created successfully');
            }
            await fetchTours();
            setIsFormOpen(false);
        } catch (err) {
            console.error('Error saving tour:', err);
            error('Failed to save tour');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this tour?')) {
            try {
                await homestayService.deleteTour(id);
                success('Tour deleted successfully');
                await fetchTours();
            } catch (err) {
                console.error('Error deleting tour:', err);
                error('Failed to delete tour');
            }
        }
    };

    const filteredTours = tours.filter(tour =>
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase">Expedition <span className="text-primary-600">Management</span></h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-1">Curate and manage your world-class tour packages</p>
                </div>
                <Button onClick={() => { setEditingTour(undefined); setIsFormOpen(true); }} className="rounded-2xl px-8 py-6 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-2 group shadow-xl shadow-primary-600/20">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Publish New Tour
                </Button>
            </div>

            <div className="relative group max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search expeditions or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 pl-16 pr-6 py-5 rounded-[2rem] border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px]">Loading Expeditions...</p>
                </div>
            ) : filteredTours.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-[3rem] border border-dashed border-neutral-200 dark:border-white/10">
                    <Compass className="w-16 h-16 text-neutral-200 dark:text-neutral-800 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">No Expeditions Found</h3>
                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mt-2">{searchQuery ? 'Try a different search term' : 'Start by publishing your first tour'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTours.map((tour) => (
                        <div key={tour.id} className="group relative bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-white/5 transition-all hover:shadow-2xl hover:shadow-primary-900/10 active:scale-[0.98]">
                            <div className="relative h-60 w-full overflow-hidden">
                                {tour.images[0] ? (
                                    <Image
                                        src={tour.images[0]}
                                        alt={tour.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <Compass className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                    {tour.category}
                                </div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <h3 className="text-xl font-black text-white truncate group-hover:text-primary-400 transition-colors uppercase leading-tight tracking-tighter">{tour.name}</h3>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 dark:bg-white/5 rounded-lg text-neutral-500 dark:text-neutral-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{tour.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 dark:bg-white/5 rounded-lg text-neutral-500 dark:text-neutral-400">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">₹{tour.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 dark:bg-white/5 rounded-lg text-neutral-500 dark:text-neutral-400">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{tour.difficulty}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-neutral-500">
                                    <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest truncate">
                                        {tour.locations.join(' • ')}
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-white/5">
                                    <button
                                        onClick={() => { setEditingTour(tour); setIsFormOpen(true); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-all group"
                                    >
                                        <Edit2 className="w-4 h-4 text-neutral-400 group-hover:text-primary-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tour.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all group"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-300 group-hover:text-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <TourForm
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    initialData={editingTour}
                />
            )}
        </div>
    );
}

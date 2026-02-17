"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { homestayService, Location } from '@/lib/services';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';
import { LocationForm } from '@/components/LocationForm';

export default function AdminLocations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const { success, error } = useToast();

    // Form state
    const [formData, setFormData] = useState<Partial<Location>>({
        name: '',
        state: '',
        description: '',
        image_url: ''
    });
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const data = await homestayService.getLocations();
            setLocations(data || []);
        } catch (err) {
            console.error(err);
            error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => { // Changed from e: React.FormEvent to data: any to match LocationForm's onSave
        setLoading(true);
        try {
            if (editingLocation) {
                await homestayService.updateLocation(editingLocation.id, data); // Use data from form
                success('Location updated successfully');
            } else {
                await homestayService.createLocation(data as Location); // Use data from form
                success('Location created successfully');
            }
            setShowForm(false);
            setFormData({ name: '', state: '', description: '', image_url: '' }); // Reset form data
            setEditingLocation(null);
            loadLocations();
        } catch (err) {
            console.error(err);
            error('Failed to save location');
            throw err; // Re-throw to allow form to handle errors if needed
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await homestayService.deleteLocation(id);
            success('Location deleted successfully');
            loadLocations();
        } catch (err) {
            console.error(err);
            error('Failed to delete location');
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest w-fit mb-4">
                        Destination Management
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        Manage Locations
                    </h1>
                    <p className="text-neutral-500 font-medium">Add or edit travel destinations for your website.</p>
                </div>
                <Button
                    onClick={() => { setEditingLocation(null); setShowForm(true); }}
                    className="rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-600/20 px-8 py-6 h-auto text-base"
                >
                    <Plus className="w-5 h-5" /> Add New Location
                </Button>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-800 pl-12 pr-4 py-3 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-neutral-100 dark:border-white/5">
                                <th className="px-8 py-6">Location</th>
                                <th className="px-8 py-6">State</th>
                                <th className="px-8 py-6">Description</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Loading Destinations...</p>
                                    </td>
                                </tr>
                            ) : filteredLocations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-neutral-400 font-medium italic">No destinations found matching your search.</p>
                                    </td>
                                </tr>
                            ) : filteredLocations.map((loc) => (
                                <tr key={loc.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black">
                                                {loc.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{loc.name}</span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID: {loc.id.split('-')[0]}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-neutral-500 dark:text-neutral-400">{loc.state}</td>
                                    <td className="px-8 py-6 text-sm text-neutral-400 max-w-xs truncate font-medium">{loc.description || 'No description provided.'}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setEditingLocation(loc); setShowForm(true); }}
                                                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 transition-colors" title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
                                                className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors" title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <LocationForm
                    initialData={editingLocation}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

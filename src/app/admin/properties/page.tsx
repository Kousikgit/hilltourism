"use client";

import { useToast } from '@/context/ToastContext';
import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Building2, MapPin, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PropertyForm } from '@/components/PropertyForm';
import { homestayService, Property, Location } from '@/lib/services';

export default function AdminProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const { success, error } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [props, locs] = await Promise.all([
                homestayService.getProperties(),
                homestayService.getLocations()
            ]);
            setProperties(props || []);
            setLocations(locs || []);
        } catch (err) {
            console.error(err);
            error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingProperty) {
                // Image Cleanup Logic: Find images present in original but missing in new data
                const originalImages = editingProperty.images || [];
                const newImages = data.images || [];

                const imagesToDelete = originalImages.filter(img => !newImages.includes(img));

                if (imagesToDelete.length > 0) {
                    console.log('Cleaning up removed images:', imagesToDelete);
                    await Promise.all(imagesToDelete.map(url => homestayService.deletePropertyImage(url)));
                }

                await homestayService.updateProperty(editingProperty.id, data);
                success('Property updated successfully');
            } else {
                await homestayService.createProperty(data);
                success('Property created successfully');
            }
            loadData();
            setShowForm(false);
        } catch (err) {
            console.error('Error saving property:', err);
            error('Failed to save property');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this homestay?')) return;
        try {
            // Find property to get images
            const propertyToDelete = properties.find(p => p.id === id);

            if (propertyToDelete?.images?.length) {
                console.log('Deleting property images:', propertyToDelete.images);
                await Promise.all(propertyToDelete.images.map(url => homestayService.deletePropertyImage(url)));
            }

            await homestayService.deleteProperty(id);
            success('Property deleted successfully');
            loadData();
        } catch (err) {
            console.error('Error deleting property:', err);
            error('Failed to delete property');
        }
    };

    const filteredProperties = properties.filter(prop =>
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit mb-4">
                        Property Portfolio
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        Manage Homestays
                    </h1>
                    <p className="text-neutral-500 font-medium">Control your inventory of premium hill station properties.</p>
                </div>
                <Button
                    onClick={async () => {
                        setEditingProperty(null);
                        const locs = await homestayService.getLocations();
                        setLocations(locs);
                        setShowForm(true);
                    }}
                    className="rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-600/20 px-8 py-6 h-auto text-base"
                >
                    <Plus className="w-5 h-5" /> Add New Property
                </Button>
            </div>

            {/* ... table ... */}
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a property by name or address..."
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
                                <th className="px-8 py-6">Property Details</th>
                                <th className="px-8 py-6">Tier</th>
                                <th className="px-8 py-6">Stay Type</th>
                                <th className="px-8 py-6">Starting Price</th>
                                <th className="px-8 py-6">Rooms</th>
                                <th className="px-8 py-6">Amenities</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
                                    </td>
                                </tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <p className="text-neutral-400 font-medium italic">No homestays found.</p>
                                    </td>
                                </tr>
                            ) : filteredProperties.map((prop) => (
                                <tr key={prop.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-neutral-200 dark:border-white/5 shadow-sm">
                                                {prop.images && prop.images[0] ? (
                                                    <Image src={prop.images[0]} alt={prop.name} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                                                        <Building2 className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-primary-600 transition-colors">{prop.name}</span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-primary-500" />
                                                    {locations.find(l => l.id === prop.location_id)?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            prop.category === 'Luxury' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                                prop.category === 'Premium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        )}>
                                            {prop.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-1">{prop.stay_category}</span>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase">Setting</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-neutral-900 dark:text-white">₹{prop.price}</span>
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter block mt-1">per night</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-primary-500" />
                                            {prop.total_rooms || 1} Rooms
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {prop.amenities?.slice(0, 2).map((amenity, idx) => (
                                                <span key={idx} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 text-[9px] font-black uppercase tracking-tighter">
                                                    {amenity}
                                                </span>
                                            ))}
                                            {(prop.amenities?.length || 0) > 2 && (
                                                <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 tracking-tighter">+{prop.amenities.length - 2} MORE</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={async () => {
                                                    setEditingProperty(prop);
                                                    const locs = await homestayService.getLocations();
                                                    setLocations(locs);
                                                    setShowForm(true);
                                                }}
                                                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 transition-colors" title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prop.id)}
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
                <PropertyForm
                    locations={locations}
                    initialData={editingProperty}
                    onClose={() => setShowForm(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

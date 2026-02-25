'use client';

import { useState } from 'react';
import { X, Save, BedDouble, Users, TrendingUp, ImageIcon, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { homestayService, HotelRoom } from '@/lib/services';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HotelRoomFormProps {
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: HotelRoom | null;
}

export function HotelRoomForm({ onClose, onSave, initialData }: HotelRoomFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: initialData?.type || '',
        max_guests: initialData?.max_guests || 2,
        bed_count: initialData?.bed_count || 1,
        is_ac: initialData?.is_ac || false,
        inventory_count: initialData?.inventory_count || 5,
        price_one_guest: initialData?.price_one_guest || 0,
        price_two_guests: initialData?.price_two_guests || 0,
        price_three_plus_guests: initialData?.price_three_plus_guests || 0,
        amenities: initialData?.amenities || [],
        images: initialData?.images || [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave({
                ...formData,
                max_guests: Number(formData.max_guests),
                bed_count: Number(formData.bed_count),
                inventory_count: Number(formData.inventory_count),
                price_one_guest: Number(formData.price_one_guest),
                price_two_guests: Number(formData.price_two_guests),
                price_three_plus_guests: Number(formData.price_three_plus_guests),
            });
            onClose();
        } catch (err: any) {
            console.error('Error saving room:', err);
            setError(err.message || 'Failed to save room details.');
        } finally {
            setLoading(false);
        }
    };

    const ROOM_TYPES = [
        { label: 'Single Bedded Room with AC', beds: 1, guests: 2, ac: true },
        { label: 'Single Bedded Room without AC', beds: 1, guests: 2, ac: false },
        { label: 'Double Bedded Room with AC', beds: 1, guests: 2, ac: true },
        { label: 'Double Bedded Room without AC', beds: 1, guests: 2, ac: false },
        { label: '3 Bedded Room with AC', beds: 3, guests: 3, ac: true },
        { label: '3 Bedded Room without AC', beds: 3, guests: 3, ac: false },
        { label: '4 Bedded Room with AC', beds: 4, guests: 4, ac: true },
        { label: '4 Bedded Room without AC', beds: 4, guests: 4, ac: false },
        { label: '1 Single Bed + 1 Double Bed with AC', beds: 2, guests: 3, ac: true },
        { label: '1 Single Bed + 1 Double Bed without AC', beds: 2, guests: 3, ac: false },
    ];

    const handleTypeChange = (typeLabel: string) => {
        const selectedType = ROOM_TYPES.find(t => t.label === typeLabel);
        if (selectedType) {
            setFormData(prev => ({
                ...prev,
                type: typeLabel,
                bed_count: selectedType.beds,
                max_guests: selectedType.guests,
                is_ac: selectedType.ac
            }));
        } else {
            setFormData(prev => ({ ...prev, type: typeLabel }));
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                            <BedDouble className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                            {initialData ? 'Edit Room Type' : 'New Room Category'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <BedDouble className="w-3 h-3" /> Room Type
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold appearance-none"
                            >
                                <option value="">Select Room Type</option>
                                {ROOM_TYPES.map(type => (
                                    <option key={type.label} value={type.label}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <BedDouble className="w-3 h-3" /> Beds
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.bed_count}
                                    onChange={(e) => setFormData({ ...formData, bed_count: parseInt(e.target.value) })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Users className="w-3 h-3" /> Max Guests
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.max_guests}
                                    onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    Inventory (Total Rooms)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.inventory_count}
                                    onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl ring-1 ring-neutral-200 dark:ring-white/10">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">AC Room</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_ac: !formData.is_ac })}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        formData.is_ac ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform",
                                        formData.is_ac ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> 1 Guest
                            </label>
                            <input
                                required
                                type="number"
                                value={formData.price_one_guest}
                                onChange={(e) => setFormData({ ...formData, price_one_guest: parseFloat(e.target.value) })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm"
                                placeholder="₹"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> 2 Guests
                            </label>
                            <input
                                required
                                type="number"
                                value={formData.price_two_guests}
                                onChange={(e) => setFormData({ ...formData, price_two_guests: parseFloat(e.target.value) })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm"
                                placeholder="₹"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> 3+ Guests
                            </label>
                            <input
                                required
                                type="number"
                                value={formData.price_three_plus_guests}
                                onChange={(e) => setFormData({ ...formData, price_three_plus_guests: parseFloat(e.target.value) })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm"
                                placeholder="₹"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-tight">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="glass" onClick={onClose} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs shadow-xl shadow-primary-600/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {initialData ? 'Update Category' : 'Create Category'}</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

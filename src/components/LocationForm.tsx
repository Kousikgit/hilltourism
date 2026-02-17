"use client";

import { useState } from 'react';
import { X, Save, MapPin, AlignLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LocationFormProps {
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export function LocationForm({ onClose, onSave, initialData }: LocationFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        state: initialData?.state || '',
        description: initialData?.description || '',
        image_url: initialData?.image_url || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving location:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                            {initialData ? 'Edit Destination' : 'New Destination'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                Name
                            </label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                placeholder="Manali"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                State
                            </label>
                            <input
                                required
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                placeholder="HP"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <AlignLeft className="w-3 h-3" /> Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold resize-none"
                            placeholder="A brief overview of the place..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <ImageIcon className="w-3 h-3" /> Cover Image URL
                        </label>
                        <input
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="glass" onClick={onClose} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {initialData ? 'Update' : 'Create'}</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

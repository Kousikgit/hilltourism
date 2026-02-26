"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, Save, MapPin, AlignLeft, List, Image as ImageIcon, Loader2, TrendingUp, ShieldAlert, Sparkles, Plus, Trash2, Calendar, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tour, homestayService } from '@/lib/services';
import { cn } from '@/lib/utils';

interface TourFormProps {
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: Tour;
}

const TOUR_AMENITIES = [
    'Housekeeping', 'Wi-Fi', 'Smoking Room', 'Bathroom', 'Living Area',
    'Work Desk', 'Towels', 'Shower', 'Toiletries', 'Toilet Paper', 'Balcony'
];

const PACKAGE_INCLUSIONS = [
    'All Transport', 'Sightseeing', '3 Star Hotel Accomodaton',
    'Breakfast', 'Lunch', 'Dinner', 'Tour Guide', 'SDF'
];

export function TourForm({ onClose, onSave, initialData }: TourFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Tour, 'id' | 'created_at'>>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Domestic Tour',
        badge: initialData?.badge || '',
        images: initialData?.images || [],
        amenities: initialData?.amenities || [],
        locations: initialData?.locations || [],
        itinerary: initialData?.itinerary || [{ day: 1, title: '', activities: [''] }],
        package_includes: initialData?.package_includes || [],
        price: initialData?.price || 0,
        discount_percent: initialData?.discount_percent || 0,
        guest_prices: initialData?.guest_prices || { one: 0, two: 0, extra: 0 },
        difficulty: initialData?.difficulty || 'Easy',
        duration: initialData?.duration || '',
    });

    const [newLocation, setNewLocation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave({
                ...formData,
                price: Number(formData.price),
                // Filter out empty itinerary items or empty activities
                itinerary: formData.itinerary.map(item => ({
                    ...item,
                    activities: item.activities.filter(a => a.trim() !== '')
                })).filter(item => item.title.trim() !== '')
            });
            onClose();
        } catch (err: any) {
            console.error('Error saving tour:', err);
            setError(err.message || 'Failed to save tour. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (list: string[], item: string, key: keyof typeof formData) => {
        const updatedList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setFormData(prev => ({ ...prev, [key]: updatedList }));
    };

    const addLocation = () => {
        if (newLocation.trim()) {
            setFormData(prev => ({
                ...prev,
                locations: [...prev.locations, newLocation.trim()]
            }));
            setNewLocation('');
        }
    };

    const removeLocation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            locations: prev.locations.filter((_, i) => i !== index)
        }));
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: '', activities: [''] }]
        }));
    };

    const removeItineraryDay = (index: number) => {
        const updated = formData.itinerary.filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, day: i + 1 }));
        setFormData(prev => ({ ...prev, itinerary: updated }));
    };

    const updateItineraryItem = (index: number, field: string, value: any) => {
        const updated = [...formData.itinerary];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, itinerary: updated }));
    };

    const addActivity = (dayIndex: number) => {
        const updated = [...formData.itinerary];
        updated[dayIndex].activities = [...updated[dayIndex].activities, ''];
        setFormData(prev => ({ ...prev, itinerary: updated }));
    };

    const updateActivity = (dayIndex: number, actIndex: number, value: string) => {
        const updated = [...formData.itinerary];
        updated[dayIndex].activities[actIndex] = value;
        setFormData(prev => ({ ...prev, itinerary: updated }));
    };

    const removeActivity = (dayIndex: number, actIndex: number) => {
        const updated = [...formData.itinerary];
        updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex);
        setFormData(prev => ({ ...prev, itinerary: updated }));
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl h-full sm:h-auto sm:rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-4 sm:p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl sm:rounded-2xl text-primary-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                            {initialData ? 'Edit Tour' : 'New Tour Expedition'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-10 overflow-y-auto max-h-[85vh] sm:max-h-[80vh]">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Tour Name
                            </label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm sm:text-base"
                                placeholder="Everest Base Camp Trek"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <List className="w-3 h-3" /> Category
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => {
                                    const newCategory = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        category: newCategory as any,
                                        price: (newCategory === "Domestic Tour" || newCategory === "Religious Tour") ? prev.price : 0
                                    }));
                                }}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm sm:text-base appearance-none"
                            >
                                <option value="Domestic Tour">Domestic Tour</option>
                                <option value="International Tour">International Tour</option>
                                <option value="Adventure Tour">Adventure Tour</option>
                                <option value="Educational Tour">Educational Tour</option>
                                <option value="Religious Tour">Religious Tour</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className={cn(
                                "text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2",
                                (formData.category === "Domestic Tour" || formData.category === "Religious Tour") ? "text-neutral-400" : "text-neutral-300 dark:text-neutral-600"
                            )}>
                                <TrendingUp className="w-3 h-3" /> Base Pricing (₹)
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight ml-2">Starting From</span>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            disabled={formData.category !== "Domestic Tour" && formData.category !== "Religious Tour"}
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className={cn(
                                                "w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 transition-all outline-none font-bold text-sm sm:text-base",
                                                (formData.category === "Domestic Tour" || formData.category === "Religious Tour")
                                                    ? "bg-neutral-50 dark:bg-neutral-800 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500"
                                                    : "bg-neutral-100 dark:bg-neutral-900 ring-neutral-100 dark:ring-white/5 text-neutral-400 cursor-not-allowed"
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tight ml-2">Discount (%)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-rose-50/30 dark:bg-rose-900/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-rose-200 dark:ring-rose-900/20 focus:ring-2 focus:ring-rose-500 transition-all outline-none font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Bracket Pricing Section */}
                            {(formData.category === "Domestic Tour" || formData.category === "Religious Tour") && (
                                <div className="bg-neutral-50 dark:bg-white/5 p-6 rounded-3xl border border-neutral-100 dark:border-white/5 space-y-4">
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Bracket Pricing (Per Guest)
                                    </span>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">1 Guest</span>
                                            <input
                                                type="number"
                                                value={formData.guest_prices?.one}
                                                onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, one: parseFloat(e.target.value) || 0 } })}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">2 Guests</span>
                                            <input
                                                type="number"
                                                value={formData.guest_prices?.two}
                                                onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, two: parseFloat(e.target.value) || 0 } })}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Extra (3+)</span>
                                            <input
                                                type="number"
                                                value={formData.guest_prices?.extra}
                                                onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, extra: parseFloat(e.target.value) || 0 } })}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-xs"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-medium text-neutral-400 uppercase">Note: Discounts apply to these bracket prices during checkout.</p>
                                </div>
                            )}

                            {formData.category !== "Domestic Tour" && formData.category !== "Religious Tour" && (
                                <p className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2"> Manual pricing via WhatsApp only </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Difficulty
                            </label>
                            <input
                                required
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm sm:text-base"
                                placeholder="Moderate - Hard"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Duration
                            </label>
                            <input
                                required
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold text-sm sm:text-base"
                                placeholder="5 Days"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Tour Description Sections
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    try {
                                        const currentDesc = formData.description ? JSON.parse(formData.description) : [];
                                        const newDesc = Array.isArray(currentDesc) ? [...currentDesc, { title: '', content: '' }] : [{ title: 'Overview', content: formData.description }, { title: '', content: '' }];
                                        setFormData({ ...formData, description: JSON.stringify(newDesc) });
                                    } catch (e) {
                                        // fallback if current description is plain text
                                        const newDesc = [{ title: 'Overview', content: formData.description }, { title: '', content: '' }];
                                        setFormData({ ...formData, description: JSON.stringify(newDesc) });
                                    }
                                }}
                                className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline"
                            >
                                + Add Section
                            </button>
                        </div>

                        {(() => {
                            let sections = [];
                            try {
                                sections = formData.description ? JSON.parse(formData.description) : [];
                                if (!Array.isArray(sections)) throw new Error('Not an array');
                            } catch (e) {
                                sections = formData.description ? [{ title: 'Overview', content: formData.description }] : [];
                            }

                            if (sections.length === 0) {
                                sections = [{ title: 'Overview', content: '' }];
                            }

                            return (
                                <div className="space-y-4">
                                    {sections.map((section: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/5 space-y-3 relative group">
                                            <input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newSections = [...sections];
                                                    newSections[idx].title = e.target.value;
                                                    setFormData({ ...formData, description: JSON.stringify(newSections) });
                                                }}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                                placeholder="Section Title (e.g., Trip Highlights)"
                                            />
                                            <textarea
                                                rows={3}
                                                value={section.content}
                                                onChange={(e) => {
                                                    const newSections = [...sections];
                                                    newSections[idx].content = e.target.value;
                                                    setFormData({ ...formData, description: JSON.stringify(newSections) });
                                                }}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-medium text-sm resize-y"
                                                placeholder="Section Content..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSections = sections.filter((_: any, i: number) => i !== idx);
                                                    setFormData({ ...formData, description: JSON.stringify(newSections) });
                                                }}
                                                className="absolute top-2 right-2 p-1.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Locations Tags */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Key Locations & Stops
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {formData.locations.map((loc, idx) => (
                                <span key={idx} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                                    {loc}
                                    <button type="button" onClick={() => removeLocation(idx)} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <div className="flex items-center gap-2">
                                <input
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                                    className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 rounded-xl text-[10px] font-bold border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none w-32"
                                    placeholder="Add stop..."
                                />
                                <button type="button" onClick={addLocation} className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Tour Amenities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {TOUR_AMENITIES.map((amenity) => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleItem(formData.amenities, amenity, 'amenities')}
                                    className={cn(
                                        "px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center border",
                                        formData.amenities.includes(amenity)
                                            ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20"
                                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border-neutral-100 dark:border-white/5 hover:border-primary-500/30"
                                    )}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Package Includes */}
                    <div className="space-y-4 bg-neutral-50/50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3" /> Package Inclusions
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {PACKAGE_INCLUSIONS.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => toggleItem(formData.package_includes, item, 'package_includes')}
                                    className={cn(
                                        "px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center border",
                                        formData.package_includes.includes(item)
                                            ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20"
                                            : "bg-white dark:bg-neutral-900 text-neutral-400 border-neutral-100 dark:border-white/10 hover:border-primary-500/30"
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Itinerary Builder */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Day-wise Itinerary
                            </label>
                            <Button type="button" onClick={addItineraryDay} variant="glass" size="sm" className="rounded-xl text-[10px] h-8 font-black uppercase tracking-widest">
                                <Plus className="w-3 h-3 mr-1" /> Add Day
                            </Button>
                        </div>
                        <div className="space-y-6">
                            {formData.itinerary.map((day, dIdx) => (
                                <div key={dIdx} className="p-6 bg-neutral-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                                Day {day.day}
                                            </div>
                                            <input
                                                value={day.title}
                                                onChange={(e) => updateItineraryItem(dIdx, 'title', e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                                                placeholder="Day Title (e.g., Arrival at Manali)"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeItineraryDay(dIdx)} className="p-2 text-neutral-400 hover:text-red-500 mt-6">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-3 pl-4 border-l-2 border-primary-500/20 ml-2">
                                        {day.activities.map((act, aIdx) => (
                                            <div key={aIdx} className="flex gap-2">
                                                <input
                                                    value={act}
                                                    onChange={(e) => updateActivity(dIdx, aIdx, e.target.value)}
                                                    className="flex-1 bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none text-xs font-semibold"
                                                    placeholder="Activity details..."
                                                />
                                                <button type="button" onClick={() => removeActivity(dIdx, aIdx)} className="p-1.5 text-neutral-400 hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addActivity(dIdx)} className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                            <Plus className="w-3 h-3" /> Add Activity
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <ImageIcon className="w-3 h-3" /> Tour Gallery
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.images.map((url, idx) => (
                                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group">
                                    <Image src={url} alt="Tour image" fill className="object-cover" unoptimized />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="space-y-4 col-span-full">
                                <input
                                    type="file" multiple accept="image/*" className="hidden" id="tour-image-upload"
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length === 0) return;
                                        setLoading(true);
                                        try {
                                            const urls = await Promise.all(files.map(f => homestayService.uploadPropertyImage(f)));
                                            setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                                        } catch (err: any) {
                                            setError(err.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                                <label htmlFor="tour-image-upload" className="p-10 border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-[2.5rem] text-center block cursor-pointer hover:border-primary-500/30 transition-all bg-neutral-50/50 dark:bg-white/5">
                                    <ImageIcon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                                    <p className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tight">Upload Expedition Photos</p>
                                </label>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-tight flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                        <Button type="button" variant="glass" onClick={onClose} className="flex-1 rounded-2xl py-4 sm:py-6 h-auto font-black uppercase text-[10px] sm:text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 rounded-2xl py-4 sm:py-6 h-auto font-black uppercase text-[10px] sm:text-xs shadow-xl shadow-primary-600/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {initialData ? 'Update Expedition' : 'Publish Tour'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

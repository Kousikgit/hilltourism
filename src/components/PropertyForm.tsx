"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, Save, Building2, MapPin, AlignLeft, List, Image as ImageIcon, Loader2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Location, homestayService } from '@/lib/services';
import { cn } from '@/lib/utils';

interface PropertyFormProps {
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    locations: Location[];
    initialData?: any;
}

const AMENITIES_LIST = [
    'High-Speed Wi-Fi', 'Secure Parking', 'Mountain Views',
    'In-House Dining', 'Room Heaters', '24/7 Geyser',
    'Bonfire & BBQ', 'Local Guide'
];

const HOTEL_AMENITIES = [
    'Free Wifi', 'Paid Parking', 'Room Service', 'Health and Wellness',
    'Transfers', 'Work Desk', 'Geyser', 'Room heater',
    'Mineral water', 'Toiletries', 'Restaurant', 'Security 24*7'
];

export function PropertyForm({ onClose, onSave, locations, initialData }: PropertyFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location_id: initialData?.location_id || '',
        address: initialData?.address || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Standard',
        price: initialData?.price || 0,
        discount_percent: initialData?.discount_percent || '',
        max_guests: initialData?.max_guests || 2,
        amenities: Array.isArray(initialData?.amenities) ? initialData.amenities : [],
        images: Array.isArray(initialData?.images) ? initialData.images : [],
        guest_prices: initialData?.guest_prices || { one: '', two: '', extra: '' },
        total_rooms: initialData?.total_rooms || 1,
        stay_category: initialData?.stay_category || 'Mountain View',
        discount_label: initialData?.discount_label || '',
        type: initialData?.type || 'homestay',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave({
                ...formData,
                price: Number(formData.guest_prices.one) || 0,
                discount_percent: formData.discount_percent ? Number(formData.discount_percent) : 0,
                max_guests: initialData?.max_guests || 20,
                guest_prices: {
                    one: Number(formData.guest_prices.one) || 0,
                    two: Number(formData.guest_prices.two) || 0,
                    extra: Number(formData.guest_prices.extra) || 0,
                },
                total_rooms: Number(formData.total_rooms) || 1,
                stay_category: formData.stay_category,
                discount_label: formData.discount_label,
            });
            onClose();
        } catch (err: any) {
            console.error('Error saving property:', err);
            setError(err.message || 'Failed to save property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => {
            const currentAmenities = Array.isArray(prev.amenities) ? prev.amenities : [];
            const newAmenities = currentAmenities.includes(amenity)
                ? currentAmenities.filter((a: string) => a !== amenity)
                : [...currentAmenities, amenity];
            return { ...prev, amenities: newAmenities };
        });
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                            {initialData?.id ? (
                                `Edit ${formData.type === 'hotel' ? 'Hotel' : 'Property'}`
                            ) : (
                                `New ${formData.type === 'hotel' ? 'Hotel' : 'Homestay'}`
                            )}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                {formData.type === 'hotel' && !initialData?.id && (
                    <div className="px-8 py-4 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-500/10 flex items-start gap-3 shrink-0">
                        <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-tight">Step 1: Create Hotel Profile</p>
                            <p className="text-[10px] text-primary-600/80 dark:text-primary-400/70 font-medium leading-relaxed mt-0.5">
                                Start by adding the main hotel details. You will be able to add Room Categories, Inventory, and specific Room Pricing in the next step.
                            </p>
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto flex-1 p-8 space-y-8">
                    <form id="property-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> {formData.type === 'hotel' ? 'Hotel' : 'Property'} Name
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                    placeholder="Mountain View Villa"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Location
                                </label>
                                <select
                                    required
                                    value={formData.location_id}
                                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold appearance-none"
                                >
                                    <option value="">Select a destination</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}, {loc.state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <List className="w-3 h-3" /> {formData.type === 'hotel' ? 'Hotel' : 'Property'} Category
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold appearance-none"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>


                            {formData.type !== 'hotel' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Stay Category
                                    </label>
                                    <select
                                        required
                                        value={formData.stay_category}
                                        onChange={(e) => setFormData({ ...formData, stay_category: e.target.value as any })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold appearance-none"
                                    >
                                        <option value="Mountain View">Mountain View Stays</option>
                                        <option value="River Side">River Side Stays</option>
                                        <option value="Tea Estate">Tea Estate Stays</option>
                                        <option value="Heritage Stays">Heritage Stays</option>
                                        <option value="Offbeat Stays">Offbeat Stays</option>
                                        <option value="Workstation">Workstation</option>
                                    </select>
                                </div>
                            )}

                        </div>

                        {formData.type !== 'hotel' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-500" /> Special Offer Label
                                    </label>
                                    <select
                                        value={formData.discount_label}
                                        onChange={(e) => setFormData({ ...formData, discount_label: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold appearance-none"
                                    >
                                        <option value="">No Special Offer</option>
                                        <option value="Summer Special">Summer Special</option>
                                        <option value="Monsoon Offer">Monsoon Offer</option>
                                        <option value="Winter Special">Winter Special</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3 text-red-500" /> DISCOUNT (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                        placeholder="e.g. 10 for 10% OFF"
                                    />
                                </div>
                            </div>
                        )}


                        {formData.type !== 'hotel' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Total Rooms
                                </label>
                                <input
                                    required
                                    type="number"
                                    value={formData.total_rooms}
                                    onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                />
                            </div>
                        )}



                        {formData.type !== 'hotel' && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Guest Pricing (₹)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-500 ml-2">1 Guest (Total Price)</label>
                                        <input
                                            type="number"
                                            value={formData.guest_prices.one}
                                            onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, one: e.target.value } })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-3 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                            placeholder="e.g. 1500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-500 ml-2">2 Guests (Total Price)</label>
                                        <input
                                            type="number"
                                            value={formData.guest_prices.two}
                                            onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, two: e.target.value } })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-3 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                            placeholder="e.g. 1800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-neutral-500 ml-2">Extra Guest (Per Person)</label>
                                        <input
                                            type="number"
                                            value={formData.guest_prices.extra}
                                            onChange={(e) => setFormData({ ...formData, guest_prices: { ...formData.guest_prices, extra: e.target.value } })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-3 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                            placeholder="e.g. 500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Full Address
                            </label>
                            <input
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                placeholder="123 Pine Road, Old Manali, HP"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Description Sections
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
                                                    placeholder="Section Title (e.g., About the Property)"
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

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <List className="w-3 h-3" /> Amenities & Features (Optional)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(formData.type === 'hotel' ? HOTEL_AMENITIES : AMENITIES_LIST).map((amenity) => (
                                    <button
                                        key={amenity} // Assumes unique amenity strings
                                        type="button"
                                        onClick={() => toggleAmenity(amenity)}
                                        className={cn(
                                            "px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center border",
                                            Array.isArray(formData.amenities) && formData.amenities.includes(amenity)
                                                ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20"
                                                : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border-neutral-100 dark:border-white/5 hover:border-primary-500/30"
                                        )}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Image Gallery
                            </label>
                            <div className="space-y-6">
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {formData.images.map((url: string, idx: number) => (
                                            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10">
                                                <Image
                                                    src={url}
                                                    alt={`Preview ${idx + 1}`}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-110"
                                                    unoptimized
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = formData.images.filter((_: string, i: number) => i !== idx);
                                                        setFormData({ ...formData, images: updated });
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-95"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        id="image-upload-trigger"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length === 0) return;

                                            setLoading(true);
                                            setError(null);
                                            try {
                                                const uploadPromises = files.map(file => homestayService.uploadPropertyImage(file));
                                                const urls = await Promise.all(uploadPromises);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    images: [...prev.images, ...urls]
                                                }));
                                            } catch (err: any) {
                                                console.error('Upload error:', err);
                                                setError(`Upload failed: ${err.message || 'Unknown error'}`);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="image-upload-trigger"
                                        className="p-10 border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-[2.5rem] text-center space-y-3 hover:border-primary-500/30 transition-all group cursor-pointer block"
                                    >
                                        <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            {loading ? <Loader2 className="w-7 h-7 text-primary-500 animate-spin" /> : <ImageIcon className="w-7 h-7 text-primary-500" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                                                {loading ? 'Processing Uploads...' : 'Upload Photos from Disk'}
                                            </p>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Select one or more images for your gallery</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Direct Image Links (Optional)</label>
                                    <textarea
                                        rows={2}
                                        value={formData.images.join(', ')}
                                        onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-200 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold resize-none text-[11px]"
                                        placeholder="https://image-url1.jpg, https://image-url2.jpg..."
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-tight">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-8 border-t border-neutral-100 dark:border-white/5 shrink-0 bg-white dark:bg-neutral-900">
                    <div className="flex gap-4">
                        <Button type="button" variant="glass" onClick={onClose} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" form="property-form" disabled={loading} className="flex-1 rounded-[1.5rem] py-6 h-auto font-black uppercase text-xs shadow-xl shadow-primary-600/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {initialData ? 'Update Hotel' : 'Create Hotel & Continue'}</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

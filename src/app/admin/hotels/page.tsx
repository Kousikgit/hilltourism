'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, Loader2, MapPin, BedDouble, Users, Wind, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { homestayService, Hotel, Location, HotelRoom } from '@/lib/services';
import { PropertyForm } from '@/components/PropertyForm';
import { HotelRoomForm } from '@/components/HotelRoomForm';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminHotels() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const { success, error } = useToast();

    // Room management state
    const [managingRoomsHotel, setManagingRoomsHotel] = useState<Hotel | null>(null);
    const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [hotelData, locs] = await Promise.all([
                homestayService.getHotels(),
                homestayService.getLocations()
            ]);
            setHotels(hotelData || []);
            setLocations(locs || []);
        } catch (err) {
            console.error(err);
            error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadRooms = async (hotelId: string) => {
        try {
            const rooms = await homestayService.getRoomsByHotel(hotelId);
            setHotelRooms(rooms || []);
        } catch (err) {
            console.error('Error loading rooms:', err);
            error('Failed to load rooms');
        }
    };

    const handleHotelSave = async (data: any) => {
        try {
            // Clean data for hotels table
            const hotelData = {
                name: data.name,
                location_id: data.location_id,
                description: data.description,
                address: data.address,
                category: data.category,
                price: data.price,
                discount_percent: data.discount_percent,
                amenities: data.amenities,
                images: data.images,
                total_rooms: data.total_rooms
            };

            if (editingHotel) {
                await homestayService.updateHotel(editingHotel.id, hotelData);
                success('Hotel updated successfully');
            } else {
                const newHotel = await homestayService.createHotel(hotelData);
                success('Hotel created successfully');
                // Auto-open Manage Rooms for new hotels to fulfill "Step 2" promise
                if (newHotel) {
                    setManagingRoomsHotel(newHotel);
                    await loadRooms(newHotel.id);
                }
            }
            loadData();
            setShowHotelForm(false); // Close form on success
        } catch (err) {
            console.error('Error saving hotel:', err);
            error('Failed to save hotel');
            throw err;
        }
    };

    const handleHotelDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hotel? All associated rooms will also be affected.')) return;
        try {
            await homestayService.deleteHotel(id);
            success('Hotel deleted successfully');
            loadData();
        } catch (err) {
            console.error('Error deleting hotel:', err);
            error('Failed to delete hotel');
        }
    };

    const handleRoomSave = async (data: any) => {
        if (!managingRoomsHotel) return;
        try {
            const roomData = { ...data, hotel_id: managingRoomsHotel.id };
            if (editingRoom) {
                await homestayService.updateHotelRoom(editingRoom.id, roomData);
                success('Room updated successfully');
            } else {
                await homestayService.createHotelRoom(roomData);
                success('Room created successfully');
            }
            loadRooms(managingRoomsHotel.id);
            setShowRoomForm(false);
        } catch (err) {
            console.error('Error saving room:', err);
            error('Failed to save room');
            throw err;
        }
    };

    const handleRoomDelete = async (id: string) => {
        if (!confirm('Delete this room type?')) return;
        try {
            await homestayService.deleteHotelRoom(id);
            success('Room deleted successfully');
            if (managingRoomsHotel) loadRooms(managingRoomsHotel.id);
        } catch (err) {
            console.error('Error deleting room:', err);
            error('Failed to delete room');
        }
    };

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit mb-4">
                        Hospitality Portfolio
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        Manage Hotels
                    </h1>
                    <p className="text-neutral-500 font-medium">Control your hotel listings and room configurations.</p>
                </div>
                <Button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            setEditingHotel(null);
                            // Refresh locations to ensure we have the latest list
                            const locs = await homestayService.getLocations();
                            setLocations(locs || []);
                            setShowHotelForm(true);
                        } catch (err) {
                            console.error('Error opening hotel form:', err);
                            error('Failed to load data');
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-600/20 px-8 py-6 h-auto text-base"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Add New Hotel
                </Button>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a hotel by name or address..."
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
                                <th className="px-8 py-6">Hotel Details</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Starting Price</th>
                                <th className="px-8 py-6">Room Types</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Loading Hotels...</p>
                                    </td>
                                </tr>
                            ) : filteredHotels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-neutral-400 font-medium italic">No hotels found.</p>
                                    </td>
                                </tr>
                            ) : filteredHotels.map((hotel) => (
                                <tr key={hotel.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-neutral-200 dark:border-white/5 shadow-sm">
                                                {hotel.images && hotel.images[0] ? (
                                                    <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                                                        <Building2 className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-primary-600 transition-colors">{hotel.name}</span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-primary-500" />
                                                    {locations.find(l => l.id === hotel.location_id)?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            hotel.category === 'Luxury' ? 'bg-purple-50 text-purple-600' :
                                                hotel.category === 'Premium' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-blue-50 text-blue-600'
                                        )}>
                                            {hotel.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-neutral-900 dark:text-white">₹{hotel.price}</span>
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter block mt-1">Starting From</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Button
                                            variant="glass"
                                            size="sm"
                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                            onClick={() => {
                                                setManagingRoomsHotel(hotel);
                                                loadRooms(hotel.id);
                                            }}
                                        >
                                            <BedDouble className="w-3.5 h-3.5" /> Manage Rooms
                                        </Button>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={async () => {
                                                    setEditingHotel(hotel);
                                                    const locs = await homestayService.getLocations();
                                                    setLocations(locs);
                                                    setShowHotelForm(true);
                                                }}
                                                className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 transition-colors" title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleHotelDelete(hotel.id)}
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

            {/* Hotel Form Modal */}
            {showHotelForm && (
                <PropertyForm
                    locations={locations}
                    initialData={editingHotel ? { ...editingHotel, type: 'hotel' } : { type: 'hotel' }}
                    onClose={() => setShowHotelForm(false)}
                    onSave={handleHotelSave}
                />
            )}

            {/* Room Management Modal */}
            {managingRoomsHotel && (
                <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                            <div>
                                <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Room Categories</h2>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{managingRoomsHotel.name}</p>
                            </div>
                            <div className="flex gap-4">
                                <Button size="sm" onClick={() => { setEditingRoom(null); setShowRoomForm(true); }} className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Category
                                </Button>
                                <button onClick={() => setManagingRoomsHotel(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-neutral-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {hotelRooms.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-[2.5rem]">
                                    <BedDouble className="w-12 h-12 text-neutral-100 dark:text-white/5 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest italic">No rooms configured yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {hotelRooms.map(room => (
                                        <div key={room.id} className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-[2rem] border border-neutral-100 dark:border-white/5 flex flex-col gap-6 group hover:border-primary-500/20 transition-all">
                                            <div className="flex justify-between items-start w-full">
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                            room.inventory_count < 3 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                                        )}>
                                                            <Archive className="w-3 h-3" /> {room.inventory_count} Units Left
                                                        </span>
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                            room.is_ac ? "bg-sky-100 text-sky-600" : "bg-neutral-200 text-neutral-500"
                                                        )}>
                                                            <Wind className="w-3 h-3" /> {room.is_ac ? "AC Room" : "Non-AC"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">{room.type}</h3>
                                                        <div className="flex items-center gap-3 mt-1 text-neutral-400">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                                <BedDouble className="w-3 h-3" /> {room.bed_count} Beds
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> Max {room.max_guests} Guests
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingRoom(room); setShowRoomForm(true); }} className="p-2.5 rounded-xl bg-white dark:bg-neutral-700 hover:bg-primary-50 text-neutral-400 hover:text-primary-600 transition-all shadow-sm border border-neutral-100 dark:border-white/5">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleRoomDelete(room.id)} className="p-2.5 rounded-xl bg-white dark:bg-neutral-700 hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-all shadow-sm border border-neutral-100 dark:border-white/5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-white/5">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">1 Guest</span>
                                                    <span className="text-sm font-black text-neutral-900 dark:text-white">₹{room.price_one_guest}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">2 Guests</span>
                                                    <span className="text-sm font-black text-neutral-900 dark:text-white">₹{room.price_two_guests}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">3+ Guests</span>
                                                    <span className="text-sm font-black text-neutral-900 dark:text-white">₹{room.price_three_plus_guests}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showRoomForm && (
                <HotelRoomForm
                    initialData={editingRoom}
                    onClose={() => setShowRoomForm(false)}
                    onSave={handleRoomSave}
                />
            )}
        </div>
    );
}

const X = ({ className, ...props }: any) => (
    <svg
        {...props}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

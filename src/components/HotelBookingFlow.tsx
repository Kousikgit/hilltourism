'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Users, CreditCard, ShieldCheck, Sparkles, Loader2, Minus, Plus, Calendar, Info, ChevronLeft, ChevronRight, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Hotel, HotelRoom, homestayService } from '@/lib/services';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface CalendarPickerProps {
    checkIn: string;
    checkOut: string;
    onDateSelect: (checkIn: string, checkOut: string) => void;
    activeField: 'checkIn' | 'checkOut';
    setActiveField: (field: 'checkIn' | 'checkOut') => void;
}

function CalendarPicker({ checkIn, checkOut, onDateSelect, activeField, setActiveField }: CalendarPickerProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));

    const isSelected = (date: Date) => {
        const dStr = getDateString(date);
        return dStr === checkIn || dStr === checkOut;
    };

    const isInRange = (date: Date) => {
        if (!checkIn || !checkOut) return false;
        const dStr = getDateString(date);
        return dStr > checkIn && dStr < checkOut;
    };

    const handleDateClick = (date: Date) => {
        const dStr = getDateString(date);
        if (date < today) return;

        if (activeField === 'checkIn') {
            onDateSelect(dStr, '');
            setActiveField('checkOut');
        } else {
            if (dStr <= checkIn) {
                onDateSelect(dStr, '');
                setActiveField('checkOut');
            } else {
                onDateSelect(checkIn, dStr);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <span key={d} className="text-[10px] font-black text-neutral-400 uppercase tracking-widest py-2">{d}</span>
                ))}
                {days.map((d, idx) => {
                    if (!d) return <div key={`empty-${idx}`} />;
                    const selected = isSelected(d);
                    const inRange = isInRange(d);
                    const past = d < today;
                    const dStr = getDateString(d);
                    const isCheckIn = dStr === checkIn;
                    const isCheckOut = dStr === checkOut;

                    return (
                        <button
                            key={idx}
                            disabled={past}
                            type="button"
                            onClick={() => handleDateClick(d)}
                            className={cn(
                                "h-10 relative flex items-center justify-center text-[11px] font-bold transition-all",
                                past ? "text-neutral-200 dark:text-neutral-800 cursor-not-allowed" : "hover:scale-110 active:scale-95",
                                selected ? "bg-primary-500 text-white rounded-xl z-10 shadow-lg shadow-primary-500/20" :
                                    inRange ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" :
                                        "text-neutral-700 dark:text-neutral-300",
                                isCheckIn && checkOut && "rounded-r-none rounded-l-xl",
                                isCheckOut && "rounded-l-none rounded-r-xl"
                            )}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-neutral-100 dark:border-white/5 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-200" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">In Range</span>
                </div>
            </div>
        </div>
    );
}

interface HotelBookingFlowProps {
    hotel: Hotel;
    onClose: () => void;
}

export function HotelBookingFlow({ hotel, onClose }: HotelBookingFlowProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'dates' | 'rooms' | 'guests' | 'details' | 'success'>('dates');
    const [rooms, setRooms] = useState<HotelRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        nights: 1,
        adults: 1,
        children_5_8: 0,
        children_below_5: 0,
        user_name: '',
        user_email: '',
        user_phone: ''
    });

    const [activeField, setActiveField] = useState<'checkIn' | 'checkOut'>('checkIn');
    const [tokenTier, setTokenTier] = useState<25 | 50>(25);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await homestayService.getRoomsByHotel(hotel.id);
                setRooms(data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };
        fetchRooms();
    }, [hotel.id]);

    useEffect(() => {
        if (selectedRoom && formData.checkIn && formData.checkOut && hotel.id) {
            // Debounce the check to prevent rapid requests and potential Supabase lock errors
            const timer = setTimeout(() => {
                const checkAvailability = async () => {
                    try {
                        const isAvailable = await homestayService.checkAvailability(
                            hotel.id,
                            formData.checkIn,
                            formData.checkOut,
                            true, // isHotel
                            selectedRoom.id // Pass roomTypeId for specific inventory check
                        );

                        if (!isAvailable) {
                            console.log('Room type sold out for these dates');
                        }
                    } catch (e) {
                        // Ignore AbortError as it's likely due to rapid component updates or auth locks
                        if (e instanceof Error && e.name === 'AbortError') return;
                        console.error('Error checking availability', e);
                    }
                };
                checkAvailability();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [selectedRoom, formData.checkIn, formData.checkOut, hotel.id]);

    const pricingInfo = useMemo(() => {
        if (!selectedRoom || !formData.checkIn || !formData.checkOut) return { total: 0, nights: 0, tokenPayable: 0, secondPayable: 0, arrivalPayable: 0, isUrgent: false, primaryRate: 0, nightlyTotal: 0 };

        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leadTimeDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = leadTimeDays <= 15;

        const totalGuests = formData.adults + formData.children_5_8;
        let primaryRate = 0;

        if (totalGuests === 1) {
            primaryRate = selectedRoom.price_one_guest;
        } else if (totalGuests === 2) {
            primaryRate = selectedRoom.price_two_guests;
        } else {
            primaryRate = selectedRoom.price_three_plus_guests;
        }

        const nightlyTotal = primaryRate;
        const total = nightlyTotal * nights;

        const effectiveTier = isUrgent ? 50 : tokenTier;
        const tokenPayable = Math.round(total * (effectiveTier / 100));
        const secondPayable = !isUrgent && effectiveTier === 25 ? Math.round(total * 0.25) : 0;
        const arrivalPayable = total - tokenPayable - secondPayable;

        return {
            total,
            nights,
            nightlyTotal,
            primaryRate,
            tokenPayable,
            secondPayable,
            arrivalPayable,
            isUrgent,
            leadTimeDays,
            effectiveTier
        };
    }, [formData, selectedRoom, tokenTier]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                hotel_id: hotel.id,
                hotel_room_id: selectedRoom?.id,
                user_name: formData.user_name,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                total_price: pricingInfo.total,
                token_amount: pricingInfo.tokenPayable,
                guests: formData.adults + formData.children_5_8,
                adults: formData.adults,
                children_5_8: formData.children_5_8,
                children_below_5: formData.children_below_5,
                status: 'pending'
            };

            await homestayService.createBooking(bookingData);
            setStep('success');
        } catch (error) {
            console.error('Booking failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-white/5 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                            <BedDouble className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase leading-none">Hotel Reservation</h2>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">{hotel.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-all">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 h-full overflow-hidden">
                    {/* Left: Content */}
                    <div className="md:col-span-3 p-8 pb-32 space-y-8 overflow-y-auto custom-scrollbar">
                        {step === 'dates' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" /> Selection of Stay
                                    </h3>
                                    <div className="p-6 bg-neutral-50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5">
                                        <CalendarPicker
                                            checkIn={formData.checkIn}
                                            checkOut={formData.checkOut}
                                            onDateSelect={(inDate, outDate) => {
                                                setFormData(prev => ({ ...prev, checkIn: inDate, checkOut: outDate }));
                                            }}
                                            activeField={activeField}
                                            setActiveField={setActiveField}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setActiveField('checkIn')}
                                            className={cn(
                                                "p-4 rounded-2xl border text-left transition-all",
                                                activeField === 'checkIn' ? "bg-primary-50 border-primary-500 ring-4 ring-primary-500/10" : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5"
                                            )}
                                        >
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Check-In</span>
                                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{formData.checkIn ? formatDisplayDate(formData.checkIn) : 'Select Date'}</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveField('checkOut')}
                                            className={cn(
                                                "p-4 rounded-2xl border text-left transition-all",
                                                activeField === 'checkOut' ? "bg-primary-50 border-primary-500 ring-4 ring-primary-500/10" : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5"
                                            )}
                                        >
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Check-Out</span>
                                            <span className="font-bold text-sm text-neutral-900 dark:text-white">{formData.checkOut ? formatDisplayDate(formData.checkOut) : 'Select Date'}</span>
                                        </button>
                                    </div>

                                    {pricingInfo.nights > 0 && (
                                        <div className="p-4 bg-primary-50 rounded-2xl flex gap-3 items-center border border-primary-100 italic">
                                            <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                                            <p className="text-[10px] font-bold text-primary-800 uppercase leading-relaxed">
                                                Duration of Stay: <span className="font-black">{pricingInfo.nights} {pricingInfo.nights === 1 ? 'Night' : 'Nights'}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setStep('rooms')}
                                    disabled={!formData.checkIn || !formData.checkOut}
                                    className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                >
                                    Choose Room Type
                                </Button>
                            </div>
                        ) : step === 'rooms' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <BedDouble className="w-4 h-4 text-primary-500" /> Room Categories
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {rooms.map(room => (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={cn(
                                                    "p-6 rounded-2xl border-2 transition-all text-left space-y-3",
                                                    selectedRoom?.id === room.id
                                                        ? "bg-primary-50 border-primary-500 ring-4 ring-primary-500/10"
                                                        : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 hover:border-primary-500/30"
                                                )}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] block mb-1">Room Type</span>
                                                        <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{room.type}</h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Starts Prize</span>
                                                        <span className="text-lg font-black text-primary-600 italic-none">₹{room.price_one_guest.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                        <Users className="w-3 h-3" /> Max {room.max_guests} Guests
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 uppercase tracking-wider bg-primary-50 px-3 py-1 rounded-full">
                                                        Available Now
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={() => setStep('dates')} variant="glass" className="flex-1 rounded-2xl py-6 uppercase font-black text-[10px]">Back</Button>
                                    <Button
                                        onClick={() => setStep('guests')}
                                        disabled={!selectedRoom}
                                        className="flex-[2] rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                    >
                                        Select Guests
                                    </Button>
                                </div>
                            </div>
                        ) : step === 'guests' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary-500" /> Guest Configuration
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Adults', sub: '12+ years', key: 'adults', min: 1 },
                                            { label: 'Children', sub: '5-8 years', key: 'children_5_8', min: 0 },
                                            { label: 'Infants', sub: 'Below 5y', key: 'children_below_5', min: 0 }
                                        ].map((cat) => (
                                            <div key={cat.key} className="flex justify-between items-center bg-neutral-50 dark:bg-white/5 p-6 rounded-2xl border border-neutral-100 dark:border-white/5">
                                                <div>
                                                    <div className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">{cat.label}</div>
                                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{cat.sub}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, [cat.key]: Math.max(cat.min, (prev as any)[cat.key] - 1) }))}
                                                        className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-white/5 hover:border-primary-500/30 transition-all active:scale-95"
                                                    >
                                                        <Minus className="w-4 h-4 text-neutral-400" />
                                                    </button>
                                                    <span className="text-lg font-black text-neutral-900 dark:text-white w-4 text-center">{(formData as any)[cat.key]}</span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            const total = formData.adults + formData.children_5_8 + formData.children_below_5;
                                                            if (total >= (selectedRoom?.max_guests || 4)) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            setFormData(prev => ({ ...prev, [cat.key]: (prev as any)[cat.key] + 1 }));
                                                        }}
                                                        className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-white/5 hover:border-primary-500/30 transition-all active:scale-95"
                                                    >
                                                        <Plus className="w-4 h-4 text-primary-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <p className="text-[9px] font-black text-amber-800 uppercase leading-relaxed text-center italic tracking-widest">
                                            Max {selectedRoom?.max_guests} Guests Allowed for {selectedRoom?.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={() => setStep('rooms')} variant="glass" className="flex-1 rounded-2xl py-6 uppercase font-black text-[10px]">Back</Button>
                                    <Button
                                        onClick={() => setStep('details')}
                                        className="flex-[2] rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                    >
                                        Payment Options
                                    </Button>
                                </div>
                            </div>
                        ) : step === 'details' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary-500" /> Payment & Identity
                                    </h3>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Choose Milestone</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setTokenTier(25)}
                                                disabled={pricingInfo.isUrgent}
                                                className={cn(
                                                    "p-6 rounded-3xl border-2 transition-all text-left relative",
                                                    tokenTier === 25 ? "bg-primary-50 border-primary-500" : "bg-neutral-50/50 dark:bg-white/5 border-neutral-100 dark:border-white/5",
                                                    pricingInfo.isUrgent && "opacity-50 cursor-not-allowed bg-neutral-100"
                                                )}
                                            >
                                                <div className="font-black text-neutral-900 dark:text-white uppercase leading-none">Split Pay</div>
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">25% Token Now</div>
                                                {tokenTier === 25 && <div className="absolute top-4 right-4"><CreditCard className="w-4 h-4 text-primary-500" /></div>}
                                            </button>
                                            <button
                                                onClick={() => setTokenTier(50)}
                                                className={cn(
                                                    "p-6 rounded-3xl border-2 transition-all text-left relative",
                                                    tokenTier === 50 ? "bg-primary-50 border-primary-500" : "bg-neutral-50/50 dark:bg-white/5 border-neutral-100 dark:border-white/5"
                                                )}
                                            >
                                                <div className="font-black text-neutral-900 dark:text-white uppercase leading-none">Partial Pay</div>
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">50% Token Now</div>
                                                {tokenTier === 50 && <div className="absolute top-4 right-4"><CreditCard className="w-4 h-4 text-primary-500" /></div>}
                                            </button>
                                        </div>
                                        {pricingInfo.isUrgent && (
                                            <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">Urgent Booking: 50% Token Mandatory ({"<"}15 Days)</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Reservation Full Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.user_name}
                                                    onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                                                    className="w-full bg-neutral-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                                    placeholder="e.g. Rahul Sharma"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.user_email}
                                                        onChange={e => setFormData({ ...formData, user_email: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                                        placeholder="rahul@example.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">WhatsApp Number</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.user_phone}
                                                        onChange={e => setFormData({ ...formData, user_phone: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold"
                                                        placeholder="+91 00000 00000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button onClick={() => setStep('guests')} variant="glass" className="flex-1 rounded-2xl py-6 uppercase font-black text-[10px]">Back</Button>
                                    <Button
                                        onClick={handleBooking}
                                        disabled={loading || !formData.user_name || !formData.user_email}
                                        className="flex-[2] rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Confirm Reservation'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-primary-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary-500/20">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Confirmed!</h3>
                                    <p className="text-neutral-500 font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px]">Your stay at {hotel.name} is successfully reserved.</p>
                                </div>
                                <Button onClick={onClose} className="rounded-2xl px-12 py-6 h-auto font-black uppercase tracking-widest text-xs">Close Gateway</Button>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div className="md:col-span-2 bg-neutral-50 dark:bg-white/[0.02] p-8 pb-32 border-l border-neutral-100 dark:border-white/5 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest">Reservation Summary</h3>

                            <div className="space-y-4">
                                <div className="space-y-3 bg-white dark:bg-neutral-800 p-5 rounded-[2rem] shadow-sm border border-neutral-100 dark:border-white/5">
                                    <span className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest leading-none block mb-2">Pricing Breakdown</span>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-tight">
                                                <span className="font-bold text-neutral-400">Stay Period</span>
                                                <span className="font-black text-neutral-900 dark:text-white text-right">
                                                    {formData.checkIn ? formatDisplayDate(formData.checkIn) : '--'} — {formData.checkOut ? formatDisplayDate(formData.checkOut) : '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-tight">
                                                <span className="font-bold text-neutral-400">Duration</span>
                                                <span className="font-black text-neutral-900 dark:text-white">{pricingInfo.nights} {pricingInfo.nights === 1 ? 'Night' : 'Nights'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-tight">
                                                <span className="font-bold text-neutral-400">Room</span>
                                                <span className="font-black text-neutral-900 dark:text-white">{selectedRoom?.type || '--'}</span>
                                            </div>

                                            <div className="space-y-1.5 pt-2 border-t border-neutral-50 dark:border-white/5 mt-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-600 dark:text-neutral-300">Base Rate ({formData.adults + formData.children_5_8 + formData.children_below_5} Guests)</span>
                                                    <span className="font-black text-neutral-900 dark:text-white">₹{pricingInfo.primaryRate?.toLocaleString()} / night</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-600 dark:text-neutral-300">Stay Duration</span>
                                                    <span className="font-black text-neutral-900 dark:text-white">× {pricingInfo.nights} Night(s)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-white/10" />

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-primary-500 uppercase tracking-widest italic">Token Pay Now</span>
                                                <span className="font-black text-primary-600">₹{pricingInfo.tokenPayable.toLocaleString()}</span>
                                            </div>

                                            {pricingInfo.secondPayable > 0 && (
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-400 uppercase tracking-widest italic">Second Milestone</span>
                                                    <span className="font-black text-neutral-500">₹{pricingInfo.secondPayable.toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-neutral-400 uppercase tracking-widest italic">Balance on Arrival</span>
                                                <span className="font-black text-neutral-500">₹{pricingInfo.arrivalPayable.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-white/10" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-primary-600 uppercase">Total Amount</span>
                                            <span className="text-lg font-black text-neutral-900 dark:text-white">₹{pricingInfo.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary-500/10 rounded-[2.5rem] border border-primary-500/20 space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary-500" />
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Secure Reservation</span>
                            </div>
                            <p className="text-[9px] font-bold text-primary-600/70 uppercase leading-relaxed tracking-wider">
                                Your booking is encrypted and handled by our Secure Gateway. You'll receive an official WhatsApp confirmation instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

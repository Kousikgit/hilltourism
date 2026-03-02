'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Users, CreditCard, ShieldCheck, Sparkles, Loader2, Minus, Plus, Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, BedDouble, AlertOctagon } from 'lucide-react';
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
    const [showCalendar, setShowCalendar] = useState(false);
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
        if (!selectedRoom || !formData.checkIn || !formData.checkOut) return { total: 0, nights: 0, tokenPayable: 0, secondPayable: 0, arrivalPayable: 0, isUrgent: false, primaryRate: 0, nightlyTotal: 0, discountAmount: 0, pricingMultiplier: 0, totalHumans: 0, originalNightlyRate: 0 };

        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leadTimeDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = leadTimeDays <= 15;

        const totalHumans = formData.adults + formData.children_5_8 + formData.children_below_5;
        const totalGuestsForRate = formData.adults + formData.children_5_8;

        let baseRate = 0;
        if (totalGuestsForRate === 1) {
            baseRate = selectedRoom.price_one_guest;
        } else if (totalGuestsForRate === 2) {
            baseRate = selectedRoom.price_two_guests;
        } else {
            baseRate = selectedRoom.price_three_plus_guests;
        }

        const pricingMultiplier = formData.adults + (formData.children_5_8 * 0.5);

        const originalNightlyRate = baseRate;
        let nightlyRate = baseRate;
        let discountAmount = 0;

        if (hotel.discount_percent && hotel.discount_percent > 0) {
            nightlyRate = Math.round(baseRate * (1 - hotel.discount_percent / 100));
            discountAmount = originalNightlyRate - nightlyRate;
        }

        const nightlyTotal = Math.round(nightlyRate * pricingMultiplier);
        const total = nightlyTotal * nights;

        const effectiveTier = isUrgent ? 50 : tokenTier;
        const tokenPayable = Math.round(total * (effectiveTier / 100));
        const secondPayable = !isUrgent && effectiveTier === 25 ? Math.round(total * 0.25) : 0;
        const arrivalPayable = total - tokenPayable - secondPayable;

        return {
            total,
            nights,
            nightlyTotal,
            primaryRate: nightlyRate,
            tokenPayable,
            secondPayable,
            arrivalPayable,
            isUrgent,
            leadTimeDays,
            effectiveTier,
            discountAmount,
            pricingMultiplier,
            totalHumans,
            originalNightlyRate
        };
    }, [formData, selectedRoom, tokenTier, hotel.discount_percent]);

    useEffect(() => {
        if (pricingInfo.isUrgent) {
            setTokenTier(50);
        }
    }, [pricingInfo.isUrgent]);

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
                guests: pricingInfo.totalHumans,
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
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl h-full sm:h-auto sm:rounded-[3rem] shadow-2xl overflow-hidden border border-neutral-100 dark:border-white/5 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full border border-neutral-100 dark:border-white/10 shadow-sm hover:bg-neutral-100 dark:hover:bg-white/10 transition-all z-50 group"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 group-hover:text-primary-600 dark:text-neutral-400 transition-colors" />
                    </button>
                )}

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar scroll-smooth">
                    {/* Progress Bar */}
                    <div className="flex justify-between mb-4 sm:mb-8 relative max-w-md mx-auto">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 dark:bg-white/5 -translate-y-1/2 -z-10" />
                        {[
                            { id: 'dates', icon: CalendarIcon, label: 'Dates' },
                            { id: 'rooms', icon: BedDouble, label: 'Rooms' },
                            { id: 'guests', icon: Users, label: 'Guests' },
                            { id: 'details', icon: CreditCard, label: 'Payment' },
                        ].map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-1 sm:gap-2 bg-white dark:bg-neutral-900 px-2 sm:px-4">
                                <div className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                    step === s.id ? "bg-primary-600 text-white scale-110 shadow-lg" : "bg-neutral-100 dark:bg-white/5 text-neutral-400"
                                )}>
                                    <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className={cn("text-[8px] sm:text-xs font-bold uppercase tracking-wider", step === s.id ? "text-primary-600" : "text-neutral-400")}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
                        {step === 'dates' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Select Stay Dates</h3>

                                {showCalendar && (
                                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                                        <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-none sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                                            <button
                                                onClick={() => setShowCalendar(false)}
                                                className="absolute top-4 right-4 p-2 bg-neutral-100 dark:bg-white/5 rounded-full hover:bg-primary-50 transition-colors"
                                            >
                                                <X className="w-4 h-4 text-neutral-500" />
                                            </button>
                                            <div className="mb-4">
                                                <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">Select {activeField === 'checkIn' ? 'Check-in' : 'Check-out'} Date</h4>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Available dates marked on calendar</p>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                                                <CalendarPicker
                                                    checkIn={formData.checkIn}
                                                    checkOut={formData.checkOut}
                                                    onDateSelect={(inDate, outDate) => {
                                                        setFormData(prev => ({ ...prev, checkIn: inDate, checkOut: outDate }));
                                                        if (inDate && outDate) {
                                                            setTimeout(() => setShowCalendar(false), 300);
                                                        }
                                                    }}
                                                    activeField={activeField}
                                                    setActiveField={setActiveField}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => setShowCalendar(false)}
                                                className="w-full mt-6 rounded-2xl py-4 font-black uppercase text-xs"
                                            >
                                                Confirm Dates
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            setActiveField('checkIn');
                                            setShowCalendar(true);
                                        }}
                                        className="space-y-1 text-left group"
                                    >
                                        <label className={cn(
                                            "text-[8px] sm:text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                                            activeField === 'checkIn' && showCalendar ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                        )}>Check-in Date</label>
                                        <div className={cn(
                                            "p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-neutral-800 border transition-all font-bold dark:text-white min-h-[48px] sm:min-h-[56px] flex items-center text-xs sm:text-sm",
                                            activeField === 'checkIn' && showCalendar ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-neutral-700" : "border-neutral-100 dark:border-white/5"
                                        )}>
                                            {formData.checkIn ? formatDisplayDate(formData.checkIn) : 'Select Date'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveField('checkOut');
                                            setShowCalendar(true);
                                        }}
                                        className="space-y-1 text-left group"
                                    >
                                        <label className={cn(
                                            "text-[8px] sm:text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                                            activeField === 'checkOut' && showCalendar ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                        )}>Check-out Date</label>
                                        <div className={cn(
                                            "p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-neutral-800 border transition-all font-bold dark:text-white min-h-[48px] sm:min-h-[56px] flex items-center text-xs sm:text-sm",
                                            activeField === 'checkOut' && showCalendar ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-neutral-700" : "border-neutral-100 dark:border-white/5"
                                        )}>
                                            {formData.checkOut ? formatDisplayDate(formData.checkOut) : 'Select Date'}
                                        </div>
                                    </button>
                                </div>

                                {pricingInfo.nights > 0 && (
                                    <div className="p-4 bg-primary-50 rounded-2xl flex gap-3 items-center border border-primary-100 italic">
                                        <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                                        <p className="text-[10px] font-bold text-primary-800 uppercase leading-relaxed">
                                            Stay Duration: <span className="font-black">{pricingInfo.nights} {pricingInfo.nights === 1 ? 'Night' : 'Nights'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : step === 'rooms' ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Choice of Suite</h3>
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
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] block mb-1">Room Category</span>
                                                    <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{room.type}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Nightly Price</span>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            {hotel.discount_percent && hotel.discount_percent > 0 && (
                                                                <span className="text-sm font-bold text-neutral-400 line-through">₹{room.price_one_guest.toLocaleString()}</span>
                                                            )}
                                                            <span className="text-lg font-black text-primary-600">₹{(hotel.discount_percent ? Math.round(room.price_one_guest * (1 - hotel.discount_percent / 100)) : room.price_one_guest).toLocaleString()}</span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Base Rate</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                    <Users className="w-3 h-3" /> Max {room.max_guests} Guests
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : step === 'guests' ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Guest Composition</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Adults', sub: '12+ years', key: 'adults', min: 1 },
                                        { label: 'Children', sub: '5-8 years', key: 'children_5_8', min: 0 },
                                        { label: 'Infants', sub: 'Below 5y', key: 'children_below_5', min: 0 }
                                    ].map((cat) => (
                                        <div key={cat.key} className="flex justify-between items-center bg-neutral-50 dark:bg-white/5 p-6 rounded-3xl border border-neutral-100 dark:border-white/5">
                                            <div>
                                                <div className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">{cat.label}</div>
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{cat.sub}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, [cat.key]: Math.max(cat.min, (prev as any)[cat.key] - 1) }))}
                                                    className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-white/5 hover:border-primary-500/30 transition-all active:scale-95"
                                                >
                                                    <Minus className="w-4 h-4 text-neutral-400" />
                                                </button>
                                                <span className="text-lg font-black text-neutral-900 dark:text-white w-4 text-center">{(formData as any)[cat.key]}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const total = formData.adults + formData.children_5_8 + formData.children_below_5;
                                                        if (total >= (selectedRoom?.max_guests || 4)) return;
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
                        ) : step === 'details' ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Review & Payment</h3>

                                <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Accomodation</span>
                                        <span className="font-black text-neutral-900 dark:text-white text-sm text-right uppercase tracking-widest">{hotel.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Suite</span>
                                        <span className="font-black text-neutral-900 dark:text-white text-sm text-right">{selectedRoom?.type || '--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Guests</span>
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-neutral-900 dark:text-white text-sm text-right">{pricingInfo.totalHumans} Person(s)</span>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">
                                                {formData.adults}A {formData.children_5_8 > 0 && `+ ${formData.children_5_8}K (5-8)`} {formData.children_below_5 > 0 && `+ ${formData.children_below_5}K (<5)`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Duration</span>
                                        <span className="font-black text-neutral-900 dark:text-white text-xs text-right">
                                            {formatDisplayDate(formData.checkIn)} — {formatDisplayDate(formData.checkOut)}
                                            <br />
                                            <span className="text-[10px] text-neutral-400">{pricingInfo.nights} Night(s)</span>
                                        </span>
                                    </div>

                                    <div className="h-px bg-primary-200/20 dark:bg-white/5" />

                                    <div className="space-y-3 bg-neutral-50 dark:bg-white/5 p-4 rounded-2xl border border-neutral-100 dark:border-white/5">
                                        <span className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest leading-none block mb-2">Price Breakdown</span>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-neutral-600 dark:text-neutral-300">Adults ({formData.adults})</span>
                                                <div className="flex items-center gap-2">
                                                    {(pricingInfo.discountAmount || 0) > 0 && (
                                                        <span className="text-[8px] text-neutral-400 line-through">₹{(pricingInfo.originalNightlyRate || 0).toLocaleString()}</span>
                                                    )}
                                                    <span className="font-black text-neutral-900 dark:text-white">₹{(pricingInfo.primaryRate || 0).toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.adults}</span></span>
                                                </div>
                                            </div>

                                            {formData.children_5_8 > 0 && (
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-600 dark:text-neutral-300">Child 5-8y ({formData.children_5_8})</span>
                                                    <div className="flex items-center gap-2">
                                                        {(pricingInfo.discountAmount || 0) > 0 && (
                                                            <span className="text-[8px] text-neutral-400 line-through">₹{((pricingInfo.originalNightlyRate || 0) * 0.5).toLocaleString()}</span>
                                                        )}
                                                        <span className="font-black text-neutral-900 dark:text-white">₹{((pricingInfo.primaryRate || 0) * 0.5).toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.children_5_8}</span></span>
                                                    </div>
                                                </div>
                                            )}

                                            {formData.children_below_5 > 0 && (
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-primary-600 dark:text-primary-400">Child {"<"}5y ({formData.children_below_5})</span>
                                                    <span className="font-black text-primary-600 dark:text-primary-400">FREE</span>
                                                </div>
                                            )}

                                            <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />

                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-tight">Nightly Rate</span>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">{pricingInfo.nights} Night{pricingInfo.nights > 1 ? 's' : ''} Stay</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5">
                                                        {(pricingInfo.discountAmount || 0) > 0 && (
                                                            <span className="text-[10px] text-neutral-400 line-through">₹{((pricingInfo.originalNightlyRate || 0) * (pricingInfo.pricingMultiplier || 0)).toLocaleString()}</span>
                                                        )}
                                                        <span className="text-xs font-black text-neutral-900 dark:text-white">₹{((pricingInfo.primaryRate || 0) * (pricingInfo.pricingMultiplier || 0)).toLocaleString()}</span>
                                                    </div>
                                                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">/ night</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-primary-200/50 dark:bg-white/10" />
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-primary-600 dark:text-primary-400 font-black text-lg uppercase tracking-tight italic">Total Stay Cost</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-primary-900 dark:text-primary-400 leading-none">₹{pricingInfo.total.toLocaleString()}</span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Inclusive of all taxes</span>
                                            </div>
                                        </div>

                                        {/* Payment Split Selection */}
                                        <div className="space-y-3">
                                            {pricingInfo.isUrgent && (
                                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Urgent Booking Policy</p>
                                                        <p className="text-[9px] font-bold text-amber-700/80 dark:text-amber-400/80 uppercase leading-relaxed">
                                                            Your check-in is within 15 days. A mandatory 50% token payment is required to secure this last-minute reservation.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 pb-2">
                                                {[25, 50].map((tier) => (
                                                    <button
                                                        key={tier}
                                                        type="button"
                                                        disabled={pricingInfo.isUrgent && tier === 25}
                                                        onClick={() => setTokenTier(tier as any)}
                                                        className={cn(
                                                            "p-3 rounded-2xl border transition-all text-center group relative overflow-hidden",
                                                            tokenTier === tier
                                                                ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20"
                                                                : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-400 hover:border-primary-500/30",
                                                            pricingInfo.isUrgent && tier === 25 && "opacity-40 grayscale cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1">Token {tier}%</div>
                                                        <div className="text-base font-black">₹{Math.round(pricingInfo.total * (tier / 100)).toLocaleString()}</div>
                                                        {tokenTier === tier && (
                                                            <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 rounded-bl-xl flex items-center justify-center">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detailed Payment Schedule */}
                                        <div className="p-5 bg-white/50 dark:bg-black/20 rounded-[2rem] border border-primary-200/20 dark:border-white/5 space-y-4 shadow-inner">
                                            <div className="flex justify-between items-center group">
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                        Token Money (Pay Now)
                                                    </span>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">Payment through website</span>
                                                </div>
                                                <span className="text-base font-black text-primary-600 dark:text-primary-400 tracking-tight">₹{(pricingInfo.tokenPayable || 0).toLocaleString()}</span>
                                            </div>

                                            {(pricingInfo.secondPayable || 0) > 0 && (
                                                <div className="flex justify-between items-center py-3 border-y border-primary-100/10 dark:border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-amber-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-widest">Second Installment (25%)</span>
                                                        <span className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">Pay before arrival date</span>
                                                    </div>
                                                    <span className="text-base font-black text-amber-600 dark:text-amber-500 tracking-tight">₹{(pricingInfo.secondPayable || 0).toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest leading-none">Balance on Arrival</span>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase mt-1">Pay at check-in</span>
                                                </div>
                                                <span className="text-base font-black text-primary-600 dark:text-primary-400 tracking-tight">₹{(pricingInfo.arrivalPayable || 0).toLocaleString()}</span>
                                            </div>

                                            {pricingInfo.isUrgent && (
                                                <div className="mt-2 p-3 bg-primary-100/20 dark:bg-primary-900/20 rounded-xl flex items-center gap-2">
                                                    <Info className="w-3 h-3 text-primary-500" />
                                                    <span className="text-[8px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Urgent Booking: 50% Token Required</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            required
                                            value={formData.user_name}
                                            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                            placeholder="Full Name"
                                        />
                                        <input
                                            required
                                            type="email"
                                            value={formData.user_email}
                                            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                            placeholder="Email"
                                        />
                                    </div>
                                    <input
                                        required
                                        value={formData.user_phone}
                                        onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                        placeholder="WhatsApp Number"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-500">
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
                </div>

                {step !== 'success' && (
                    <div className="p-4 sm:p-6 md:p-8 pt-0 border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-900 mt-auto">
                        <div className="flex gap-4">
                            {step !== 'dates' && (
                                <Button
                                    variant="glass"
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                    onClick={() => {
                                        if (step === 'details') setStep('guests');
                                        else if (step === 'guests') setStep('rooms');
                                        else if (step === 'rooms') setStep('dates');
                                    }}
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                className={cn(
                                    "h-14 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all",
                                    step !== 'dates' ? "flex-[2]" : "w-full",
                                    !formData.checkIn && step === 'dates' ? "bg-neutral-200 text-neutral-400 shadow-none" : "shadow-primary-500/20"
                                )}
                                onClick={() => {
                                    if (step === 'dates') {
                                        if (!formData.checkIn || !formData.checkOut) return;
                                        setStep('rooms');
                                    } else if (step === 'rooms') {
                                        if (!selectedRoom) return;
                                        setStep('guests');
                                    } else if (step === 'guests') {
                                        setStep('details');
                                    } else if (step === 'details') {
                                        if (!formData.user_name || !formData.user_email || !formData.user_phone) return;
                                        handleBooking();
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    step === 'details' ? 'Confirm Reservation' :
                                        step === 'guests' ? 'Review Summary' :
                                            step === 'rooms' ? 'Configure Guests' : 'Choose Room Type'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

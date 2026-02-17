"use client";

import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, User, CreditCard, X, Users, ArrowLeft, MessageSquare, Loader2, Info, AlertOctagon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Property, Room, homestayService } from '@/lib/services';

type Step = 'dates' | 'details' | 'payment' | 'success';

interface BookingFlowProps {
    property: Property;
    rooms?: Room[]; // Optional if we are doing property-level booking
    onClose?: () => void;
}

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
    bookedDates: string[];
    onDateSelect: (checkIn: string, checkOut: string) => void;
    activeField: 'checkIn' | 'checkOut';
    setActiveField: (field: 'checkIn' | 'checkOut') => void;
}

function CalendarPicker({ checkIn, checkOut, bookedDates, onDateSelect, activeField, setActiveField }: CalendarPickerProps) {
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

    const isBooked = (date: Date) => {
        const dStr = getDateString(date);
        return bookedDates.includes(dStr);
    };

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
        if (isBooked(date)) return;
        if (date < today) return;

        if (activeField === 'checkIn') {
            onDateSelect(dStr, '');
            setActiveField('checkOut');
        } else {
            if (dStr <= checkIn) {
                onDateSelect(dStr, '');
                setActiveField('checkOut');
            } else {
                // Check if range contains booked dates
                let hasBookedInRange = false;
                const start = new Date(checkIn);
                const end = new Date(dStr);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    if (isBooked(d)) {
                        hasBookedInRange = true;
                        break;
                    }
                }

                if (hasBookedInRange) {
                    onDateSelect(dStr, '');
                    setActiveField('checkOut');
                } else {
                    onDateSelect(checkIn, dStr);
                }
            }
        }
    };

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <span key={d} className="text-[10px] font-black text-neutral-400 uppercase tracking-widest py-2">{d}</span>
                ))}
                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />;
                    const booked = isBooked(date);
                    const selected = isSelected(date);
                    const inRange = isInRange(date);
                    const past = date < today;
                    const dStr = getDateString(date);
                    const checkInDate = dStr === checkIn;
                    const checkOutDate = dStr === checkOut;

                    return (
                        <button
                            key={idx}
                            disabled={past}
                            onClick={() => handleDateClick(date)}
                            className={cn(
                                "h-10 relative flex items-center justify-center text-[11px] font-bold transition-all",
                                past ? "text-neutral-200 dark:text-neutral-800 cursor-not-allowed" : "hover:scale-110 active:scale-95",
                                selected ? "bg-primary-600 text-white rounded-xl z-10 shadow-lg shadow-primary-600/30" :
                                    inRange ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" :
                                        booked ? "text-red-500/50 cursor-pointer" : "text-neutral-700 dark:text-neutral-300",
                                checkInDate && checkOut && "rounded-r-none rounded-l-xl",
                                checkOutDate && "rounded-l-none rounded-r-xl"
                            )}
                        >
                            {date.getDate()}
                            {booked && !selected && (
                                <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 border-t border-neutral-100 dark:border-white/5 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Selected</span>
                </div>
            </div>
        </div>
    );
}

export function BookingFlow({ property, rooms = [], onClose }: BookingFlowProps) {
    const [step, setStep] = useState<Step>('dates');
    const [error, setError] = useState<string | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        adults: 1,
        children_5_8: 0,
        children_below_5: 0,
        name: '',
        email: '',
        phone: '',
        room_id: rooms[0]?.id || '',
    });

    const [activeField, setActiveField] = useState<'checkIn' | 'checkOut'>('checkIn');
    const [tokenTier, setTokenTier] = useState<25 | 50>(25);

    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [loadingDates, setLoadingDates] = useState(false);

    useEffect(() => {
        loadBookedDates();
    }, [property.id]);

    const loadBookedDates = async () => {
        setLoadingDates(true);
        try {
            const dates = await homestayService.getBookedDates(property.id);
            setBookedDates(dates);
        } catch (err) {
            console.error('Failed to load booked dates:', err);
        } finally {
            setLoadingDates(false);
        }
    };

    const pricingInfo = useMemo(() => {
        if (!formData.checkIn || !formData.checkOut) return { total: 0, nights: 0, nightlyRate: 0, originalTotal: 0, discountAmount: 0 };
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return { total: 0, nights: 0, nightlyRate: 0, originalTotal: 0, discountAmount: 0, tokenPayable: 0, secondPayable: 0, arrivalPayable: 0, leadTimeDays: 0, isUrgent: false, totalHumans: 0, pricingMultiplier: 0, originalNightlyRate: 0 };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leadTimeDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = leadTimeDays <= 15;

        let baseRate = property.price;

        const totalHumans = formData.adults + formData.children_5_8 + formData.children_below_5;
        // Calculation logic: Adults = 1x, Children 5-8 = 0.5x, Children <5 = 0x
        const pricingMultiplier = formData.adults + (formData.children_5_8 * 0.5);

        if (property.guest_prices) {
            const { one, two, extra } = property.guest_prices;
            if (totalHumans === 1 && one) baseRate = one;
            else if (totalHumans === 2 && two) baseRate = two;
            else if (totalHumans > 2 && extra) baseRate = extra;
        }

        const originalTotal = (baseRate * pricingMultiplier) * nights;
        let nightlyRate = baseRate;
        let total = originalTotal;
        let discountAmount = 0;

        if (property.discount_percent && property.discount_percent > 0) {
            nightlyRate = Math.round(baseRate * (1 - property.discount_percent / 100));
            total = (nightlyRate * pricingMultiplier) * nights;
            discountAmount = originalTotal - total;
        }

        const effectiveTier = isUrgent ? 50 : tokenTier;
        const tokenPayable = Math.round(total * (effectiveTier / 100));
        const secondPayable = !isUrgent && effectiveTier === 25 ? Math.round(total * 0.25) : 0;
        const arrivalPayable = total - tokenPayable - secondPayable;

        return {
            total,
            nights,
            nightlyRate,
            originalTotal,
            discountAmount,
            tokenPayable,
            secondPayable,
            arrivalPayable,
            leadTimeDays,
            isUrgent,
            totalHumans,
            pricingMultiplier,
            originalNightlyRate: baseRate
        };
    }, [formData.checkIn, formData.checkOut, formData.adults, formData.children_5_8, formData.children_below_5, property, tokenTier]);

    const calculateTotal = pricingInfo.total;

    const nextStep = async () => {
        if (error) return;
        if (step === 'dates') {
            if (!formData.checkIn || !formData.checkOut) {
                setError('Please select check-in and check-out dates');
                return;
            }
            if (formData.adults < 1) {
                setError('At least 1 adult is required');
                return;
            }

            setCheckingAvailability(true);
            try {
                const isAvailable = await homestayService.checkAvailability(
                    property.id,
                    formData.checkIn,
                    formData.checkOut,
                    false,
                    formData.room_id || undefined
                );

                if (!isAvailable) {
                    setError('Sorry, this property is fully booked for the selected dates.');
                    setCheckingAvailability(false);
                    return;
                }
            } catch (err) {
                console.error('Availability check failed:', err);
                setError('Unable to verify availability. Please try again.');
                setCheckingAvailability(false);
                return;
            }
            setCheckingAvailability(false);
            setStep('details');
        }
        else if (step === 'details') {
            if (!formData.name || !formData.email || !formData.phone) {
                setError('Please fill in all details');
                return;
            }
            setStep('payment');
        }
        else if (step === 'payment') {
            setCheckingAvailability(true);
            try {
                const finalRoomId = formData.room_id || (rooms.length > 0 ? rooms[0].id : null);

                await homestayService.createBooking({
                    property_id: property.id,
                    room_id: finalRoomId,
                    user_email: formData.email,
                    user_name: formData.name,
                    user_phone: formData.phone,
                    check_in: formData.checkIn,
                    check_out: formData.checkOut,
                    total_price: calculateTotal,
                    token_amount: pricingInfo.tokenPayable,
                    guests: pricingInfo.totalHumans,
                    adults: formData.adults,
                    children_5_8: formData.children_5_8,
                    children_below_5: formData.children_below_5,
                    status: 'confirmed'
                });
                setStep('success');
            } catch (err: any) {
                console.error('Booking creation failed:', err);
                setError(`Submission Error: ${err.message || 'Please check your connection and try again.'}`);
            }
            setCheckingAvailability(false);
        }
    };

    const prevStep = () => {
        if (step === 'details') setStep('dates');
        else if (step === 'payment') setStep('details');
        setError(null);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full border border-neutral-100 dark:border-white/10 shadow-sm hover:bg-neutral-100 dark:hover:bg-white/10 transition-all z-50 group"
                >
                    <X className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 dark:text-neutral-400 transition-colors" />
                </button>
            )}

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar scroll-smooth">

                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 dark:bg-white/5 -translate-y-1/2 -z-10" />
                    {[
                        { id: 'dates', icon: CalendarIcon, label: 'Dates' },
                        { id: 'details', icon: User, label: 'Details' },
                        { id: 'payment', icon: CreditCard, label: 'Payment' },
                    ].map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-white dark:bg-neutral-900 px-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                step === s.id ? "bg-primary-600 text-white scale-110 shadow-lg" : "bg-neutral-100 dark:bg-white/5 text-neutral-400"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-wider", step === s.id ? "text-primary-600" : "text-neutral-400")}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="min-h-[300px]">
                    {step === 'dates' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Select Dates & Guests</h3>
                            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-white/5">
                                <CalendarPicker
                                    checkIn={formData.checkIn}
                                    checkOut={formData.checkOut}
                                    bookedDates={bookedDates}
                                    onDateSelect={(checkIn, checkOut) => {
                                        setFormData({ ...formData, checkIn, checkOut });
                                        setError(null);
                                    }}
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setActiveField('checkIn')}
                                    className="space-y-1 text-left group"
                                >
                                    <label className={cn(
                                        "text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                                        activeField === 'checkIn' ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                    )}>Check-in Date</label>
                                    <div className={cn(
                                        "p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border transition-all font-bold dark:text-white min-h-[56px] flex items-center",
                                        activeField === 'checkIn' ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-neutral-700" : "border-neutral-100 dark:border-white/5"
                                    )}>
                                        {formData.checkIn ? formatDisplayDate(formData.checkIn) : 'Select Date'}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveField('checkOut')}
                                    className="space-y-1 text-left group"
                                >
                                    <label className={cn(
                                        "text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                                        activeField === 'checkOut' ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                    )}>Check-out Date</label>
                                    <div className={cn(
                                        "p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border transition-all font-bold dark:text-white min-h-[56px] flex items-center",
                                        activeField === 'checkOut' ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-neutral-700" : "border-neutral-100 dark:border-white/5"
                                    )}>
                                        {formData.checkOut ? formatDisplayDate(formData.checkOut) : 'Select Date'}
                                    </div>
                                </button>
                            </div>

                            {rooms.length > 1 && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Room Type</label>
                                    <select
                                        value={formData.room_id}
                                        onChange={e => {
                                            setFormData({ ...formData, room_id: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none font-bold dark:text-white"
                                    >
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.type} Room - ₹{room.price_one_guest}/night
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {bookedDates.length > 0 && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                                        <AlertOctagon className="w-3 h-3" /> Fully Booked Dates
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {bookedDates.map(date => (
                                            <span key={date} className="px-2 py-0.5 rounded-lg bg-white dark:bg-neutral-800 text-[9px] font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-100 dark:border-white/5">
                                                {formatDisplayDate(date)}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[8px] font-medium text-neutral-400 uppercase tracking-tight italic">These dates are currently sold out.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Guest Breakdown</label>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Adults */}
                                    <div className="space-y-2">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest ml-1">Adults (12+)</span>
                                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-white/5">
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >-</button>
                                            <span className="flex-1 text-center font-black dark:text-white">{formData.adults}</span>
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Kids 5-8 */}
                                    <div className="space-y-2">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest ml-1">Child (5-8y)</span>
                                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-white/5">
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, children_5_8: Math.max(0, prev.children_5_8 - 1) }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >-</button>
                                            <span className="flex-1 text-center font-black dark:text-white">{formData.children_5_8}</span>
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, children_5_8: prev.children_5_8 + 1 }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >+</button>
                                        </div>
                                        <p className="text-[7px] font-black text-primary-500 uppercase tracking-widest text-center">50% OF COST</p>
                                    </div>

                                    {/* Kids <5 */}
                                    <div className="space-y-2">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest ml-1">Child ({"<"}5y)</span>
                                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-white/5">
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, children_below_5: Math.max(0, prev.children_below_5 - 1) }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >-</button>
                                            <span className="flex-1 text-center font-black dark:text-white">{formData.children_below_5}</span>
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, children_below_5: prev.children_below_5 + 1 }))}
                                                className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 flex items-center justify-center font-bold hover:bg-primary-50 transition-colors"
                                            >+</button>
                                        </div>
                                        <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest text-center">NO COST</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest ml-1 text-center">
                                    {property.guest_prices ? 'Dynamic Pricing Applies' : `Capacity: ${property.max_guests} guests`}
                                </p>
                                {property.guest_prices && (
                                    <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/5">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">1 Guest</span>
                                            <span className="text-xs font-black text-primary-600 dark:text-primary-400">₹{property.guest_prices.one}<span className="text-[8px] opacity-60">/p</span></span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">2 Guests</span>
                                            <span className="text-xs font-black text-primary-600 dark:text-primary-400">₹{property.guest_prices.two}<span className="text-[8px] opacity-60">/p</span></span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">3+ Guests</span>
                                            <span className="text-xs font-black text-primary-600 dark:text-primary-400">₹{property.guest_prices.extra}<span className="text-[8px] opacity-60">/p</span></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Guest Information</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Sharma"
                                        value={formData.name}
                                        onChange={e => {
                                            setFormData({ ...formData, name: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-bold dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. rahul@example.com"
                                        value={formData.email}
                                        onChange={e => {
                                            setFormData({ ...formData, email: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-bold dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={e => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            setError(null);
                                        }}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 font-bold dark:text-white"
                                    />
                                    {formData.phone && (
                                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight ml-1 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/5 animate-in slide-in-from-top-2 fade-in duration-300">
                                            <MessageSquare className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-500 animate-pulse" />
                                            <span>Confirming: You will receive booking updates on this WhatsApp.</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Booking Summary</h3>
                            <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Property</span>
                                    <span className="font-black text-neutral-900 dark:text-white text-sm text-right">{property.name}</span>
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
                                    <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Stay Period</span>
                                    <span className="font-black text-neutral-900 dark:text-white text-xs text-right leading-relaxed">
                                        {formatDisplayDate(formData.checkIn)} — {formatDisplayDate(formData.checkOut)}
                                        <br />
                                        <span className="text-[10px] text-neutral-400">{pricingInfo.nights} {pricingInfo.nights === 1 ? 'Night' : 'Nights'}</span>
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
                                                <span className="font-black text-neutral-900 dark:text-white">₹{(pricingInfo.nightlyRate || 0).toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.adults}</span></span>
                                            </div>
                                        </div>

                                        {formData.children_5_8 > 0 && (
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-neutral-600 dark:text-neutral-300">Child 5-8y ({formData.children_5_8})</span>
                                                <div className="flex items-center gap-2">
                                                    {pricingInfo.discountAmount > 0 && (
                                                        <span className="text-[8px] text-neutral-400 line-through">₹{((pricingInfo.originalNightlyRate || 0) * 0.5).toLocaleString()}</span>
                                                    )}
                                                    <span className="font-black text-neutral-900 dark:text-white">₹{((pricingInfo.nightlyRate || 0) * 0.5).toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.children_5_8}</span></span>
                                                </div>
                                            </div>
                                        )}

                                        {formData.children_below_5 > 0 && (
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">Child {"<"}5y ({formData.children_below_5})</span>
                                                <span className="font-black text-emerald-600 dark:text-emerald-400">FREE</span>
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
                                                    {pricingInfo.discountAmount > 0 && (
                                                        <span className="text-[10px] text-neutral-400 line-through">₹{((pricingInfo.originalNightlyRate || 0) * (pricingInfo.pricingMultiplier || 0)).toLocaleString()}</span>
                                                    )}
                                                    <span className="text-xs font-black text-neutral-900 dark:text-white">₹{((pricingInfo.nightlyRate || 0) * (pricingInfo.pricingMultiplier || 0)).toLocaleString()}</span>
                                                </div>
                                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">/ night</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-primary-200/50 dark:bg-white/10" />
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-primary-600 dark:text-primary-400 font-black text-lg uppercase tracking-tight italic text-glow">Total Stay Cost</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-primary-900 dark:text-primary-400 leading-none">₹{pricingInfo.total.toLocaleString()}</span>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Inclusive of all taxes</span>
                                        </div>
                                    </div>

                                    {/* Payment Tier Selection */}
                                    {!pricingInfo.isUrgent && (
                                        <div className="grid grid-cols-2 gap-3 pb-2">
                                            {[25, 50].map((tier) => (
                                                <button
                                                    key={tier}
                                                    type="button"
                                                    onClick={() => setTokenTier(tier as any)}
                                                    className={cn(
                                                        "p-3 rounded-2xl border transition-all text-center group relative overflow-hidden",
                                                        tokenTier === tier
                                                            ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20"
                                                            : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-white/5 text-neutral-400 hover:border-primary-500/30"
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
                                    )}

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
                                                <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest leading-none">Balance on Arrival</span>
                                                <span className="text-[8px] text-neutral-400 font-bold uppercase mt-1">Pay at homestay check-in</span>
                                            </div>
                                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{(pricingInfo.arrivalPayable || 0).toLocaleString()}</span>
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
                            <p className="text-[10px] text-neutral-500 text-center font-black uppercase tracking-[0.2em] pt-4">
                                Official Secure Reservation System
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 fade-in duration-500 text-center">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                                <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Confirmed!</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 font-bold max-w-[300px] text-sm leading-relaxed">
                                Pack your bags! Your stay at <span className="text-neutral-900 dark:text-white">{property.name}</span> is successfully reserved.
                            </p>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                Official details sent to your WhatsApp
                            </div>
                            <Button
                                variant="glass"
                                className="mt-8 px-12 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>

                {error && step !== 'success' && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">
                            {error}
                        </p>
                    </div>
                )}

                {step !== 'success' && (
                    <div className="mt-8 flex gap-4">
                        {step !== 'dates' && (
                            <Button
                                variant="glass"
                                className="flex-1 h-16 text-xs font-black uppercase tracking-widest rounded-2xl border-neutral-100 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 active:scale-95 transition-all"
                                onClick={prevStep}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        )}
                        <Button
                            className={cn(
                                step !== 'dates' ? "flex-[2]" : "w-full",
                                "h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-95",
                                error || checkingAvailability ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none" : "shadow-primary-600/30"
                            )}
                            onClick={nextStep}
                            disabled={!!error || checkingAvailability}
                        >
                            {checkingAvailability ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> {step === 'payment' ? 'Saving...' : 'Checking...'}
                                </>
                            ) : (
                                step === 'payment' ? 'Confirm Reservation' : 'Search Capacity'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

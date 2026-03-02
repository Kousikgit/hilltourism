"use client";

import { useState, useMemo } from 'react';
import { X, Users, CreditCard, ShieldCheck, Sparkles, Loader2, Minus, Plus, Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, User, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tour, homestayService } from '@/lib/services';
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
    date: string;
    onDateSelect: (date: string) => void;
}

function CalendarPicker({ date, onDateSelect }: CalendarPickerProps) {
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

    const isSelected = (d: Date) => getDateString(d) === date;

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
                    const past = d < today;
                    return (
                        <button
                            key={idx}
                            disabled={past}
                            onClick={() => onDateSelect(getDateString(d))}
                            className={cn(
                                "h-10 relative flex items-center justify-center text-[11px] font-bold transition-all",
                                past ? "text-neutral-200 dark:text-neutral-800 cursor-not-allowed" : "hover:scale-110 active:scale-95 text-neutral-700 dark:text-neutral-300",
                                selected && "bg-primary-500 text-white rounded-xl z-10 shadow-lg shadow-primary-500/20"
                            )}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface TourBookingFlowProps {
    tour: Tour;
    onClose: () => void;
}

export function TourBookingFlow({ tour, onClose }: TourBookingFlowProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'dates' | 'guests' | 'payment'>('dates');
    const [showCalendar, setShowCalendar] = useState(false);
    const [formData, setFormData] = useState({
        checkIn: '',
        adults: 1,
        children_5_8: 0,
        children_below_5: 0,
        user_name: '',
        user_email: '',
        user_phone: '',
    });

    const [tokenTier, setTokenTier] = useState<25 | 50>(25);

    const pricingInfo = useMemo(() => {
        let baseRate = tour.price;
        const totalHumans = formData.adults + formData.children_5_8 + formData.children_below_5;
        const pricingMultiplier = formData.adults + (formData.children_5_8 * 0.5);

        if (tour.guest_prices) {
            const { one, two, extra } = tour.guest_prices;
            if (totalHumans === 1 && one) baseRate = one;
            else if (totalHumans === 2 && two) baseRate = two;
            else if (totalHumans > 2 && extra) baseRate = extra;
        }

        const originalTotal = baseRate * pricingMultiplier;
        let nightlyRate = baseRate;
        let total = originalTotal;
        let discountAmount = 0;

        if (tour.discount_percent && tour.discount_percent > 0) {
            nightlyRate = Math.round(baseRate * (1 - tour.discount_percent / 100));
            total = nightlyRate * pricingMultiplier;
            discountAmount = originalTotal - total;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tourDate = formData.checkIn ? new Date(formData.checkIn) : null;
        const leadTimeDays = tourDate ? Math.ceil((tourDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const isUrgent = leadTimeDays <= 15;

        const effectiveTier = isUrgent ? 50 : tokenTier;
        const tokenPayable = Math.round(total * (effectiveTier / 100));
        const secondPayable = !isUrgent && effectiveTier === 25 ? Math.round(total * 0.25) : 0;
        const arrivalPayable = total - tokenPayable - secondPayable;

        return {
            total,
            nightlyRate,
            originalTotal,
            discountAmount,
            totalHumans,
            pricingMultiplier,
            originalNightlyRate: baseRate,
            tokenPayable,
            secondPayable,
            arrivalPayable,
            isUrgent,
            leadTimeDays,
            effectiveTier
        };
    }, [formData.adults, formData.children_5_8, formData.children_below_5, formData.checkIn, tour, tokenTier]);

    useEffect(() => {
        if (pricingInfo.isUrgent) {
            setTokenTier(50);
        }
    }, [pricingInfo.isUrgent]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                tour_id: tour.id,
                user_name: formData.user_name,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                check_in: formData.checkIn,
                check_out: formData.checkIn, // Same day for tours typically, or use duration later
                total_price: pricingInfo.total,
                token_amount: pricingInfo.tokenPayable,
                guests: pricingInfo.totalHumans,
                adults: formData.adults,
                children_5_8: formData.children_5_8,
                children_below_5: formData.children_below_5,
                status: 'pending'
            };

            await homestayService.createBooking(bookingData);
            router.push('/booking/success');
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
                            { id: 'guests', icon: User, label: 'Guests' },
                            { id: 'payment', icon: CreditCard, label: 'Payment' },
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
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Select Date</h3>

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
                                                <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">Select Expedition Start</h4>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Available dates marked on calendar</p>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                                                <CalendarPicker
                                                    date={formData.checkIn}
                                                    onDateSelect={(d) => {
                                                        setFormData(prev => ({ ...prev, checkIn: d }));
                                                        setError(null);
                                                        setTimeout(() => setShowCalendar(false), 300);
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                onClick={() => setShowCalendar(false)}
                                                className="w-full mt-6 rounded-2xl py-4 font-black uppercase text-xs"
                                            >
                                                Confirm Date
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="w-full text-left group space-y-2"
                                >
                                    <label className={cn(
                                        "text-[9px] font-black uppercase tracking-widest ml-1 transition-colors",
                                        showCalendar ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
                                    )}>Tour Date</label>
                                    <div className={cn(
                                        "p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border transition-all font-bold dark:text-white min-h-[56px] flex items-center justify-between",
                                        showCalendar ? "border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-neutral-700" : "border-neutral-100 dark:border-white/5"
                                    )}>
                                        <span>{formData.checkIn ? formatDisplayDate(formData.checkIn) : 'Select Expedition Date'}</span>
                                        <CalendarIcon className="w-4 h-4 text-primary-500" />
                                    </div>
                                </button>

                                <div className="p-4 bg-primary-50 rounded-2xl flex gap-3 items-start border border-primary-100">
                                    <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                                    <p className="text-[10px] font-bold text-primary-800 uppercase leading-relaxed">
                                        Select your tour start date. Payments are split into milestones based on how far in advance you book.
                                    </p>
                                </div>
                            </div>
                        ) : step === 'guests' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary-500" /> Guest Selection
                                    </h3>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'Adults', sub: '12+ years', key: 'adults', min: 1 },
                                            { label: 'Children', sub: '5-8 years', key: 'children_5_8', min: 0 },
                                            { label: 'Infants', sub: 'Below 5y', key: 'children_below_5', min: 0 }
                                        ].map((cat) => (
                                            <div key={cat.key} className="flex justify-between items-center bg-neutral-50 dark:bg-white/5 p-5 rounded-3xl border border-neutral-100 dark:border-white/5">
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
                                                        onClick={() => setFormData(prev => ({ ...prev, [cat.key]: (prev as any)[cat.key] + 1 }))}
                                                        className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-white/5 hover:border-primary-500/30 transition-all active:scale-95"
                                                    >
                                                        <Plus className="w-4 h-4 text-primary-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary-500" /> Review & Payment
                                    </h3>

                                    {/* Order Summary Integrated into Payment Step */}
                                    <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Expedition</span>
                                            <span className="font-black text-neutral-900 dark:text-white text-sm text-right uppercase tracking-widest">{tour.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Start Date</span>
                                            <span className="font-black text-neutral-900 dark:text-white text-sm text-right">{formatDisplayDate(formData.checkIn)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Total Guests</span>
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-neutral-900 dark:text-white text-sm text-right">{pricingInfo.totalHumans} Person(s)</span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">
                                                    {formData.adults}A {formData.children_5_8 > 0 && `+ ${formData.children_5_8}K (5-8)`} {formData.children_below_5 > 0 && `+ ${formData.children_below_5}K (<5)`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-primary-200/20 dark:bg-white/5" />

                                        <div className="space-y-3 bg-neutral-50 dark:bg-white/5 p-4 rounded-2xl border border-neutral-100 dark:border-white/5">
                                            <span className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest leading-none block mb-2">Price Breakdown</span>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-600 dark:text-neutral-300">Adults ({formData.adults})</span>
                                                    <div className="flex items-center gap-2">
                                                        {pricingInfo.discountAmount > 0 && (
                                                            <span className="text-[8px] text-neutral-400 line-through">₹{pricingInfo.originalNightlyRate.toLocaleString()}</span>
                                                        )}
                                                        <span className="font-black text-neutral-900 dark:text-white">₹{pricingInfo.nightlyRate.toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.adults}</span></span>
                                                    </div>
                                                </div>

                                                {formData.children_5_8 > 0 && (
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="font-bold text-neutral-600 dark:text-neutral-300">Child 5-8y ({formData.children_5_8})</span>
                                                        <div className="flex items-center gap-2">
                                                            {pricingInfo.discountAmount > 0 && (
                                                                <span className="text-[8px] text-neutral-400 line-through">₹{(pricingInfo.originalNightlyRate * 0.5).toLocaleString()}</span>
                                                            )}
                                                            <span className="font-black text-neutral-900 dark:text-white">₹{(pricingInfo.nightlyRate * 0.5).toLocaleString()} <span className="text-[8px] text-neutral-400 font-bold">× {formData.children_5_8}</span></span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />

                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-tight">Total Tour Cost</span>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-1.5">
                                                            {pricingInfo.discountAmount > 0 && (
                                                                <span className="text-[10px] text-neutral-400 line-through">₹{pricingInfo.originalTotal.toLocaleString()}</span>
                                                            )}
                                                            <span className="text-base font-black text-primary-600">₹{pricingInfo.total.toLocaleString()}</span>
                                                        </div>
                                                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest italic">Inclusive of all taxes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Payment Schedule */}
                                        <div className="p-5 bg-white/50 dark:bg-black/20 rounded-[2rem] border border-primary-200/20 dark:border-white/5 space-y-4 shadow-inner mt-4">
                                            <div className="flex justify-between items-center group">
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                        Token Money (Pay Now)
                                                    </span>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">Payment through website ({pricingInfo.effectiveTier}%)</span>
                                                </div>
                                                <span className="text-base font-black text-primary-600 dark:text-primary-400 tracking-tight">₹{pricingInfo.tokenPayable.toLocaleString()}</span>
                                            </div>

                                            {pricingInfo.secondPayable > 0 && (
                                                <div className="flex justify-between items-center py-3 border-y border-primary-100/10 dark:border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-amber-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-widest">Second Installment (25%)</span>
                                                        <span className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">Pay before arrival date</span>
                                                    </div>
                                                    <span className="text-base font-black text-amber-600 dark:text-amber-500 tracking-tight">₹{pricingInfo.secondPayable.toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-1">
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest leading-none">Balance on Arrival</span>
                                                    <span className="text-[8px] text-neutral-400 font-bold uppercase mt-1">Pay at start of tour</span>
                                                </div>
                                                <span className="text-base font-black text-primary-600 dark:text-primary-400 tracking-tight">₹{pricingInfo.arrivalPayable.toLocaleString()}</span>
                                            </div>

                                            {pricingInfo.isUrgent && (
                                                <div className="mt-2 p-3 bg-primary-100/20 dark:bg-primary-900/20 rounded-xl flex items-center gap-2">
                                                    <Info className="w-3 h-3 text-primary-500" />
                                                    <span className="text-[8px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Urgent Booking: 50% Token Required</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-6 bg-primary-500/5 rounded-[2rem] border border-primary-500/10 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic flex items-center gap-2">
                                                    Payment Split Mode
                                                </span>
                                            </div>

                                            {pricingInfo.isUrgent && (
                                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mb-2">
                                                    <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Urgent Booking Policy</p>
                                                        <p className="text-[9px] font-bold text-amber-700/80 dark:text-amber-400/80 uppercase leading-relaxed">
                                                            Your expedition is within 15 days. A mandatory 50% token payment is required to secure this last-minute booking.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    disabled={pricingInfo.isUrgent}
                                                    onClick={() => setTokenTier(25)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all text-left space-y-1 relative group overflow-hidden",
                                                        tokenTier === 25
                                                            ? "border-primary-500 bg-white shadow-lg shadow-primary-500/10"
                                                            : "border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/5",
                                                        pricingInfo.isUrgent && "opacity-50 grayscale cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className={cn("text-xs font-black uppercase", tokenTier === 25 ? "text-primary-500" : "text-neutral-400")}>Split Pay</div>
                                                    <div className="text-[9px] font-bold text-neutral-400 uppercase">25% Now</div>
                                                    {tokenTier === 25 && <div className="absolute top-0 right-0 p-1 bg-primary-500 text-white rounded-bl-lg"><ShieldCheck className="w-3 h-3" /></div>}
                                                </button>
                                                <button
                                                    onClick={() => setTokenTier(50)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all text-left space-y-1 relative group overflow-hidden",
                                                        tokenTier === 50
                                                            ? "border-primary-500 bg-white shadow-lg shadow-primary-500/10"
                                                            : "border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/5"
                                                    )}
                                                >
                                                    <div className={cn("text-xs font-black uppercase", tokenTier === 50 ? "text-primary-500" : "text-neutral-400")}>Partial Pay</div>
                                                    <div className="text-[9px] font-bold text-neutral-400 uppercase">50% Now</div>
                                                    {tokenTier === 50 && <div className="absolute top-0 right-0 p-1 bg-primary-500 text-white rounded-bl-lg"><ShieldCheck className="w-3 h-3" /></div>}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-white/5">
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
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="px-8 pb-4">
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <div className="p-4 sm:p-6 md:p-8 pt-0 border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-900">
                    <div className="flex gap-4">
                        {step !== 'dates' && (
                            <Button
                                variant="glass"
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                onClick={() => {
                                    if (step === 'payment') setStep('guests');
                                    else if (step === 'guests') setStep('dates');
                                    setError(null);
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
                                    if (!formData.checkIn) return setError('Please select a date');
                                    setStep('guests');
                                } else if (step === 'guests') {
                                    setStep('payment');
                                } else if (step === 'payment') {
                                    if (!formData.user_name || !formData.user_email || !formData.user_phone) {
                                        return setError('Please fill in all details');
                                    }
                                    handleBooking();
                                }
                                setError(null);
                            }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                step === 'payment' ? 'Confirm Reservation' :
                                    step === 'guests' ? 'Review Summary' : 'Select Guests'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

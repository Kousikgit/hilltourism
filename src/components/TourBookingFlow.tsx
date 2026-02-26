"use client";

import { useState, useMemo } from 'react';
import { X, Users, CreditCard, ShieldCheck, Sparkles, Loader2, Minus, Plus, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [step, setStep] = useState<'dates' | 'guests' | 'payment'>('dates');
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
            <div className="bg-white dark:bg-neutral-900 w-full max-w-xl h-full sm:h-auto sm:rounded-[3rem] shadow-2xl overflow-hidden border border-neutral-100 dark:border-white/5 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-4 sm:p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2 sm:p-3 bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase leading-none">Tour Booking</h2>
                            <p className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 sm:mt-1.5">{tour.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-all">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 h-full max-h-[85vh]">
                    {/* Left: Content */}
                    <div className="md:col-span-3 p-4 sm:p-6 pb-24 sm:pb-32 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
                        {step === 'dates' ? (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" /> Selective Expedition Start
                                    </h3>
                                    <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-white/5 rounded-[2rem] sm:rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                                        <CalendarPicker
                                            date={formData.checkIn}
                                            onDateSelect={(d) => setFormData(prev => ({ ...prev, checkIn: d }))}
                                        />
                                    </div>
                                    <div className="p-4 bg-primary-50 rounded-2xl flex gap-3 items-start border border-primary-100">
                                        <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                                        <p className="text-[10px] font-bold text-primary-800 uppercase leading-relaxed">
                                            Select your tour start date. Payments are split into milestones based on how far in advance you book.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setStep('guests')}
                                    disabled={!formData.checkIn}
                                    className="w-full rounded-2xl py-4 sm:py-6 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-primary-500/20"
                                >
                                    Select Guests
                                </Button>
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

                                <div className="flex gap-3 sm:gap-4">
                                    <Button onClick={() => setStep('dates')} variant="glass" className="flex-1 rounded-2xl py-4 sm:py-6 uppercase font-black text-[10px]">Back</Button>
                                    <Button
                                        onClick={() => setStep('payment')}
                                        className="flex-[2] rounded-2xl py-4 sm:py-6 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-primary-500/20"
                                    >
                                        Confirm Details
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary-500" /> Payment & Booker Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 sm:p-6 bg-primary-500/5 rounded-[2rem] border border-primary-500/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic flex items-center gap-2">
                                                    Payment Mode Selection
                                                </span>
                                                {pricingInfo.isUrgent && (
                                                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded italic">Urgent Booking</span>
                                                )}
                                            </div>

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
                                                    <div className="text-[9px] font-bold text-neutral-400 uppercase">25% Token Now</div>
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
                                                    <div className={cn("text-xs font-black uppercase", tokenTier === 50 ? "text-primary-500" : "text-neutral-400")}>{pricingInfo.isUrgent ? 'Fixed Partial' : 'Partial Pay'}</div>
                                                    <div className="text-[9px] font-bold text-neutral-400 uppercase">50% Token Now</div>
                                                    {tokenTier === 50 && <div className="absolute top-0 right-0 p-1 bg-primary-500 text-white rounded-bl-lg"><ShieldCheck className="w-3 h-3" /></div>}
                                                </button>
                                            </div>

                                            {pricingInfo.isUrgent ? (
                                                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tight ml-2 italic">
                                                    * Booking within 15 days requires minimum 50% partial payment.
                                                </p>
                                            ) : (
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight ml-2">
                                                    Select how much you want to pay while booking.
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                                            <div>
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
                                                <input
                                                    required
                                                    value={formData.user_name}
                                                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-6 py-4 rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={formData.user_email}
                                                        onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm sm:text-base"
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4 mb-2 block">Phone Number</label>
                                                    <input
                                                        required
                                                        value={formData.user_phone}
                                                        onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                                                        className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 dark:ring-white/10 focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm sm:text-base"
                                                        placeholder="+91 00000 00000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 sm:gap-4">
                                    <Button onClick={() => setStep('guests')} variant="glass" className="flex-1 rounded-2xl py-4 sm:py-6 uppercase font-black text-[10px]">Back</Button>
                                    <Button
                                        onClick={handleBooking}
                                        disabled={loading || !formData.user_name || !formData.user_email}
                                        className="flex-[2] rounded-2xl py-4 sm:py-6 font-black uppercase text-[10px] sm:text-xs shadow-xl shadow-primary-500/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Confirm Reservation'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary */}
                    <div className="md:col-span-2 bg-neutral-50 dark:bg-white/[0.02] p-4 sm:p-8 pb-32 border-l border-neutral-100 dark:border-white/5 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest">Order Summary</h3>

                            <div className="space-y-4">
                                <div className="space-y-3 bg-white dark:bg-neutral-800 p-5 rounded-[2rem] shadow-sm border border-neutral-100 dark:border-white/5">
                                    <span className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest leading-none block mb-2">Detailed Schedule</span>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-tight">
                                                <span className="font-bold text-neutral-400">Expedition Start</span>
                                                <span className="font-black text-neutral-900 dark:text-white">{formData.checkIn ? formatDisplayDate(formData.checkIn) : 'Not Selected'}</span>
                                            </div>

                                            <div className="space-y-1.5 pt-2">
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

                                                {formData.children_below_5 > 0 && (
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="font-bold text-primary-600 dark:text-primary-400">Child {"<"}5y ({formData.children_below_5})</span>
                                                        <span className="font-black text-primary-600 dark:text-primary-400 uppercase">Free</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-white/10" />

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-primary-500 uppercase tracking-widest italic">Token to Pay now</span>
                                                <span className="font-black text-primary-600">₹{pricingInfo.tokenPayable.toLocaleString()}</span>
                                            </div>

                                            {pricingInfo.secondPayable > 0 && (
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="font-bold text-neutral-400 uppercase tracking-widest italic">Pay before arrival</span>
                                                    <span className="font-black text-neutral-500">₹{pricingInfo.secondPayable.toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-neutral-400 uppercase tracking-widest italic">Balance on arrival</span>
                                                <span className="font-black text-neutral-500">₹{pricingInfo.arrivalPayable.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-neutral-100 dark:bg-white/10" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-primary-600 uppercase">Grand Total</span>
                                            <span className="text-sm font-black text-neutral-900 dark:text-white">₹{pricingInfo.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-primary-600 font-black text-lg uppercase tracking-tight italic">Total Cost</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-neutral-900 dark:text-white leading-none">₹{pricingInfo.total.toLocaleString()}</span>
                                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Ready to book</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 bg-primary-500/10 rounded-3xl border border-primary-500/20 space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary-500" />
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Secure Reservation</span>
                            </div>
                            <p className="text-[9px] font-bold text-primary-600/70 uppercase leading-relaxed">
                                Your booking will be processed immediately. You'll receive a confirmation call shortly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

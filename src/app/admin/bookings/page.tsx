"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2, Calendar, CheckCircle, Clock, XCircle, Check, X, Eye, Trash2, User, Mail, Phone, IndianRupee, MessageSquare, CreditCard, Clock3 } from 'lucide-react';
import { homestayService } from '@/lib/services';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await homestayService.getBookings();
            setBookings(data || []);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
        setUpdatingId(id);
        try {
            await homestayService.updateBookingStatus(id, status);
            await loadBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
            case 'pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
            case 'cancelled': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-neutral-50 text-neutral-600';
        }
    };

    const handleDeleteBooking = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this reservation record? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            await homestayService.deleteBooking(id);
            await loadBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Failed to delete booking. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return CheckCircle;
            case 'pending': return Clock;
            case 'cancelled': return XCircle;
            default: return Clock;
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12">
            <div className="mb-12">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 text-xs font-bold uppercase tracking-widest w-fit mb-4">
                    Guest Relations
                </div>
                <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                    Reservations
                </h1>
                <p className="text-neutral-500 font-medium">Monitor and manage all customer bookings.</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a reservation by guest name or email..."
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
                                <th className="px-8 py-6">Guest</th>
                                <th className="px-8 py-6">Property / Room</th>
                                <th className="px-8 py-6">Stay Dates</th>
                                <th className="px-8 py-6">Total Cost</th>
                                <th className="px-8 py-6 text-center">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Updating Ledger...</p>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-neutral-400 font-medium italic">No reservations found.</p>
                                    </td>
                                </tr>
                            ) : filteredBookings.map((booking) => {
                                const StatusIcon = getStatusIcon(booking.status);
                                return (
                                    <tr key={booking.id} className="group hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-tight leading-tight">{booking.user_name}</span>
                                                <span className="text-[10px] font-bold text-neutral-400 truncate max-w-[150px]">{booking.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-neutral-600 dark:text-neutral-300 text-[11px] uppercase tracking-tight">
                                                    {booking.rooms?.properties?.name || booking.properties?.name || 'Unknown Property'}
                                                </span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{booking.rooms?.type || 'Standard'} Room</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-neutral-600 dark:text-neutral-400">{new Date(booking.check_in).toLocaleDateString()}</span>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">to {new Date(booking.check_out).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-neutral-900 dark:text-white">₹{booking.total_price}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center">
                                                {booking.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 h-auto text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 shadow-lg shadow-green-900/10 transition-all active:scale-95"
                                                        >
                                                            {updatingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="glass"
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl px-4 py-2 h-auto text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]",
                                                        getStatusStyles(booking.status)
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {booking.status}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2.5 bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all active:scale-90"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    disabled={deletingId === booking.id}
                                                    className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-400 hover:text-red-600 dark:hover:text-red-500 rounded-xl transition-all active:scale-90"
                                                    title="Delete Record"
                                                >
                                                    {deletingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-neutral-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">Reservation Details</h2>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID: {selectedBooking.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {/* Guest Info */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Guest Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-1">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Full Name</span>
                                        <p className="text-sm font-black text-neutral-900 dark:text-white uppercase">{selectedBooking.user_name}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-1">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Email Address</span>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-neutral-400" />
                                            <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{selectedBooking.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-1">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">WhatsApp / Phone</span>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3 text-emerald-500" />
                                            <p className="text-sm font-black text-neutral-900 dark:text-white uppercase">{selectedBooking.user_phone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-2">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Guest Breakdown</span>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-neutral-900 dark:text-white uppercase flex justify-between">
                                                <span>Adults</span>
                                                <span>{selectedBooking.adults || selectedBooking.guests || 1}</span>
                                            </p>
                                            {selectedBooking.children_5_8 > 0 && (
                                                <p className="text-[11px] font-bold text-neutral-500 flex justify-between">
                                                    <span>Children (5-8y)</span>
                                                    <span>{selectedBooking.children_5_8}</span>
                                                </p>
                                            )}
                                            {selectedBooking.children_below_5 > 0 && (
                                                <p className="text-[11px] font-bold text-neutral-500 flex justify-between">
                                                    <span>Children ({"<"}5y)</span>
                                                    <span>{selectedBooking.children_below_5}</span>
                                                </p>
                                            )}
                                            <div className="h-px bg-neutral-100 dark:bg-white/5 my-1" />
                                            <p className="text-sm font-black text-primary-600 flex justify-between">
                                                <span>Total Guest</span>
                                                <span>{selectedBooking.guests}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stay Info */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                    <Clock3 className="w-3 h-3" /> Stay Details
                                </h3>
                                <div className="p-6 rounded-3xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-500/20 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Homestay</span>
                                        <span className="text-sm font-black text-neutral-900 dark:text-white uppercase">{selectedBooking.rooms?.properties?.name || selectedBooking.properties?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Room Type</span>
                                        <span className="text-[10px] bg-white dark:bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-100 dark:border-white/5 font-black text-primary-600 uppercase shrink-0">
                                            {selectedBooking.rooms?.type || 'Standard'} Room
                                        </span>
                                    </div>
                                    <div className="h-px bg-primary-100 dark:bg-white/5" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 text-center">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Check-in</span>
                                            <p className="text-sm font-black text-neutral-900 dark:text-white">{new Date(selectedBooking.check_in).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        </div>
                                        <div className="space-y-1 text-center border-l border-primary-100 dark:border-white/5">
                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Check-out</span>
                                            <p className="text-sm font-black text-neutral-900 dark:text-white">{new Date(selectedBooking.check_out).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> Financials & Payment Breakdown
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-1">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Total Amount</span>
                                        <div className="flex items-center gap-1.5">
                                            <IndianRupee className="w-4 h-4 text-primary-400" />
                                            <p className="text-2xl font-black uppercase italic tracking-tighter">₹{Number(selectedBooking.total_price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl space-y-1 flex flex-col justify-center",
                                        getStatusStyles(selectedBooking.status)
                                    )}>
                                        <span className="text-[8px] font-black opacity-60 uppercase tracking-widest">Current Status</span>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const Icon = getStatusIcon(selectedBooking.status);
                                                return <Icon className="w-5 h-5" />;
                                            })()}
                                            <p className="text-lg font-black uppercase italic tracking-tight">{selectedBooking.status}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Payment Breakdown */}
                                <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Token Money (Paid)</span>
                                            <span className="text-[8px] text-neutral-400 font-bold uppercase">Website Transaction</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-neutral-900 dark:text-white">₹{Number(selectedBooking.token_amount || 0).toLocaleString()}</span>
                                            <span className="ml-2 text-[10px] font-bold text-primary-500">
                                                ({selectedBooking.token_amount && selectedBooking.total_price ? Math.round((selectedBooking.token_amount / selectedBooking.total_price) * 100) : 0}%)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-neutral-100 dark:bg-white/5" />

                                    {/* Installment Logic */}
                                    {(() => {
                                        const total = Number(selectedBooking.total_price);
                                        const token = Number(selectedBooking.token_amount || 0);
                                        const percent = Math.round((token / total) * 100);

                                        if (percent === 25) {
                                            const second = Math.round(total * 0.25);
                                            const final = total - token - second;
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Second Installment</span>
                                                            <span className="text-[8px] text-neutral-400 font-bold uppercase">Pay before arrival</span>
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900 dark:text-white">₹{second.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Balance on Arrival</span>
                                                            <span className="text-[8px] text-neutral-400 font-bold uppercase">Pay at Check-in</span>
                                                        </div>
                                                        <span className="text-sm font-black text-neutral-900 dark:text-white">₹{final.toLocaleString()}</span>
                                                    </div>
                                                </>
                                            );
                                        } else {
                                            const final = total - token;
                                            return (
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Balance on Arrival</span>
                                                        <span className="text-[8px] text-neutral-400 font-bold uppercase">Pay at Check-in</span>
                                                    </div>
                                                    <span className="text-sm font-black text-neutral-900 dark:text-white">₹{final.toLocaleString()}</span>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                {selectedBooking.payment_intent_id && (
                                    <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5 flex flex-col gap-1">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Payment Transaction ID</span>
                                        <code className="text-[10px] font-mono font-bold text-neutral-500 break-all">{selectedBooking.payment_intent_id}</code>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest text-center italic">
                                    Booked on {new Date(selectedBooking.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50 dark:bg-white/5 border-t border-neutral-100 dark:border-white/5 flex gap-4">
                            <Button
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close View
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

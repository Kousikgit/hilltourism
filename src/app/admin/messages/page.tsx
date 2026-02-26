'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Trash2, Loader2, Search, Filter, MessageSquare, ShieldAlert } from 'lucide-react';
import { contactService, Contact } from '@/lib/services';
import { Button } from '@/components/ui/Button';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await contactService.getContacts();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            await contactService.deleteContact(id);
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone_number.includes(searchTerm) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                        Communication Hub
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-none uppercase italic-none">
                        Guest <span className="text-primary-600">Inquiries</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage and respond to messages from potential guests.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search inquiries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 outline-none focus:border-primary-500/30 font-bold text-sm min-w-[300px] shadow-sm transition-all"
                        />
                    </div>
                    <Button variant="glass" className="h-full rounded-2xl px-6" onClick={fetchMessages}>
                        <Filter className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="h-[50vh] flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-neutral-400 font-extrabold uppercase tracking-[.4em] text-[10px]">Syncing Messages</p>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="h-[50vh] flex flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                    <div className="w-20 h-20 bg-neutral-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center border border-neutral-100 dark:border-white/5 mb-4">
                        <MessageSquare className="w-8 h-8 text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">No Messages Found</h3>
                    <p className="text-neutral-500 font-medium">When guests contact you, their messages will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} className="group relative bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-neutral-200/20 dark:hover:shadow-none transition-all duration-500 overflow-hidden">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Sender Info */}
                                <div className="lg:w-1/4 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-black text-xl shadow-inner uppercase tracking-tighter">
                                            {msg.full_name.charAt(0)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">{msg.full_name}</h4>
                                            <p className="text-primary-600 font-bold text-xs flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-dashed border-neutral-200 dark:border-white/10 group-hover:border-primary-500/30 transition-colors">
                                            <Phone className="w-4 h-4 text-neutral-400" />
                                            <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                                {msg.phone_number}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-dashed border-neutral-200 dark:border-white/10 group-hover:border-primary-500/30 transition-colors">
                                            <Mail className="w-4 h-4 text-neutral-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Direct Connect</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="flex-1 lg:pl-8 lg:border-l border-neutral-100 dark:border-white/5 flex flex-col justify-between space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3" /> Message Details
                                            </span>
                                            {msg.message.length > 500 && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-500/10">
                                                    Long Inquery
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed font-medium">
                                            {msg.message}
                                        </p>
                                    </div>

                                    <div className="pt-6 flex items-center justify-between lg:justify-end gap-4 border-t border-neutral-50 dark:border-white/5">
                                        <Button
                                            variant="glass"
                                            className="rounded-xl px-5 text-[10px] font-black uppercase tracking-widest h-10 border-red-500/10 hover:bg-red-500/10 hover:text-red-500 text-neutral-400 flex-1 lg:flex-none transition-all"
                                            onClick={() => handleDelete(msg.id)}
                                            disabled={deletingId === msg.id}
                                        >
                                            {deletingId === msg.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                            )}
                                            {deletingId === msg.id ? 'Deleting...' : 'Delete Message'}
                                        </Button>
                                        <a
                                            href={`https://wa.me/${msg.phone_number.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 lg:flex-none"
                                        >
                                            <Button className="w-full lg:w-auto rounded-xl px-8 text-[10px] font-black uppercase tracking-widest h-10 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20">
                                                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Reply via WhatsApp
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Note */}
            <div className="mt-12 p-6 bg-neutral-900 dark:bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-6">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                    <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h5 className="text-white font-black uppercase tracking-tighter text-sm">Strict Admin Protocol</h5>
                    <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-tight">
                        Deleted messages are permanently purged from the database. <br />
                        Handle with care to maintain inquiry history.
                    </p>
                </div>
            </div>
        </div>
    );
}

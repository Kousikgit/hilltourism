'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, QrCode, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { contactService } from '@/lib/services';
import { cn } from '@/lib/utils';

export function ContactSection() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name || !formData.phone_number || !formData.message) return;

        setStatus('loading');
        try {
            await contactService.createContact(formData);
            setStatus('success');
            setFormData({ full_name: '', phone_number: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <section id="contact" className="relative py-16 md:py-20 px-4 bg-white dark:bg-neutral-950 overflow-hidden">
            {/* Premium Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-100/20 dark:bg-primary-900/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neutral-100/40 dark:bg-neutral-900/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative z-10">
                {/* Information Column */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[9px] font-black uppercase tracking-widest w-fit">
                            Connect with us
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none uppercase italic-none">
                            Get in <span className="text-primary-600">Touch</span>
                        </h2>
                        <p className="text-neutral-500 text-sm md:text-base leading-relaxed max-w-sm font-medium">
                            Plan your next escape with our boutique concierge team.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Mail, label: 'Email Us', value: 'hello@stayease.com' },
                            { icon: Phone, label: 'Call Us', value: '+91 82936 74862' },
                            { icon: MapPin, label: 'Corporate Office', value: 'Deshbandhupara, Siliguri, WB-734003' }
                        ].map((item, idx) => (
                            <div key={idx} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-all duration-300">
                                <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center shadow-md dark:shadow-none border border-neutral-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-[10px]">{item.label}</h4>
                                    <p className="text-neutral-500 font-bold text-sm md:text-base">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QR Code Section */}
                    <div className="p-6 bg-neutral-900 dark:bg-white/5 rounded-[2.5rem] flex items-center gap-6 border border-white/10">
                        <div className="w-20 h-20 bg-white p-2 rounded-2xl shrink-0 flex items-center justify-center relative group">
                            <QrCode className="w-full h-full text-neutral-900" />
                            <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-white font-black uppercase tracking-tighter text-sm">Scan to Connect</h4>
                            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-tight">
                                Quick access to our <br /> WhatsApp Support
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="lg:col-span-7 relative group mt-8 lg:mt-0">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500/10 via-transparent to-primary-500/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative bg-white dark:bg-neutral-900/50 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-neutral-100 dark:border-white/10 shadow-xl shadow-neutral-200/20 dark:shadow-none">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="John Doe"
                                    className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none text-neutral-900 dark:text-white text-sm font-bold disabled:opacity-50"
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                                    placeholder="+91 00000 00000"
                                    className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none text-neutral-900 dark:text-white text-sm font-bold disabled:opacity-50"
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Message</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="How can we help you?"
                                    className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none resize-none text-neutral-900 dark:text-white text-sm font-bold disabled:opacity-50"
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <div className="md:col-span-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={status === 'loading' || status === 'success'}
                                    className={cn(
                                        "w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-300",
                                        status === 'success'
                                            ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-600/20"
                                            : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20 hover:scale-[1.01]"
                                    )}
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : status === 'success' ? (
                                        <span className="flex items-center gap-2">
                                            Message Sent <CheckCircle2 className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Send Message <Send className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

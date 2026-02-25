'use client';

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from './ui/Button';

export function ContactSection() {
    return (
        <section className="relative py-24 px-4 bg-white dark:bg-neutral-950 overflow-hidden">
            {/* Premium Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-100/20 dark:bg-primary-900/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neutral-100/40 dark:bg-neutral-900/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative z-10">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest w-fit">
                            Connect with us
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none uppercase italic-none">
                            Get in <span className="text-primary-600">Touch</span>
                        </h2>
                        <p className="text-neutral-500 text-lg leading-relaxed max-w-md font-medium">
                            Have questions about our homestays or need help with a booking? Our boutique concierge team is here for you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-all duration-500 cursor-default">
                            <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-200/50 dark:shadow-none border border-neutral-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Mail className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">Email Us</h4>
                                <p className="text-neutral-500 font-bold text-lg">hello@stayease.com</p>
                            </div>
                        </div>

                        <div className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-all duration-500 cursor-default">
                            <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-200/50 dark:shadow-none border border-neutral-100 dark:border-white/5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                <Phone className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">Call Us</h4>
                                <p className="text-neutral-500 font-bold text-lg">+91 82936 74862</p>
                            </div>
                        </div>

                        <div className="group flex items-start gap-5 p-4 rounded-3xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-all duration-500 cursor-default">
                            <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-200/50 dark:shadow-none border border-neutral-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0">
                                <MapPin className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-sm">Corporate Office</h4>
                                <p className="text-neutral-500 font-bold leading-snug max-w-[240px]">Deshbandhupara, Beside Dada Bhai Club, Siliguri, WB-734003</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500/10 via-transparent to-primary-500/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative bg-white dark:bg-neutral-900/50 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-neutral-100 dark:border-white/10 shadow-2xl shadow-neutral-200/40 dark:shadow-none">
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-7 py-5 rounded-[1.5rem] bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none text-neutral-900 dark:text-white font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-7 py-5 rounded-[1.5rem] bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none text-neutral-900 dark:text-white font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="How can we help you?"
                                    className="w-full px-7 py-5 rounded-[1.5rem] bg-neutral-50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-primary-500/30 transition-all outline-none resize-none text-neutral-900 dark:text-white font-bold"
                                />
                            </div>
                            <Button className="w-full py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-600/20 hover:scale-[1.02] transition-all duration-300">
                                Send Message <Send className="ml-3 w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

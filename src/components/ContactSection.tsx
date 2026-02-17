'use client';

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from './ui/Button';

export function ContactSection() {
    return (
        <section className="relative py-16 px-4 bg-white dark:bg-neutral-900 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-50/30 via-white to-primary-50/40 dark:from-primary-900/10 dark:via-neutral-900 dark:to-primary-900/5" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                <div>
                    <h2 className="text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Get in Touch</h2>
                    <p className="text-neutral-600 mb-10 text-lg leading-relaxed">
                        Have questions about our homestays or need help with a booking? Our team is here to assist you 24/7.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Mail className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-900">Email Us</h4>
                                <p className="text-neutral-600">hello@stayease.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <Phone className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-900">Call Us</h4>
                                <p className="text-neutral-600">+91 82936 74862</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                <MapPin className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-900">Corporate Office</h4>
                                <p className="text-neutral-600">Deshbandhupara, Beside Dada Bhai Clud Premises, Siliguri, WB-734003</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-primary-900/5">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 ml-1">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help you?"
                                className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border-transparent focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                            />
                        </div>
                        <Button className="w-full py-4 text-lg font-bold shadow-lg shadow-primary-600/20">
                            Send Message <Send className="ml-2 w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}

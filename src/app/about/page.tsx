'use client';

import { Sparkles, Heart, Globe, ShieldCheck, ArrowRight, Home, Mountain, Waves, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

const VALUES = [
    {
        icon: ShieldCheck,
        title: "Uncompromising Quality",
        description: "Every property in our collection undergoes a rigorous 50-point inspection to ensure it meets our standards of luxury and comfort."
    },
    {
        icon: Heart,
        title: "Authentic Hospitality",
        description: "We don't just provide rooms; we create experiences. Our hosts are locals who treat every guest like family."
    },
    {
        icon: Globe,
        title: "Sustainable Tourism",
        description: "We are committed to preserving the natural beauty of the regions we operate in by supporting eco-friendly practices."
    }
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-neutral-900">
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                        alt="Mist mountains"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-transparent to-neutral-50 dark:to-neutral-950" />

                <div className="relative z-10 text-center space-y-6 px-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-md text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] w-fit mx-auto">
                        <Sparkles className="w-4 h-4" /> Our Story
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic-none leading-none">
                        Redefining <br /> <span className="text-primary-500">Hospitality</span>
                    </h1>
                    <p className="text-neutral-300 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                        Beyond four walls and a roof, we curate sanctuaries where nature meets luxury.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">
                                    Our Mission: <br /> <span className="text-primary-600">Peace in Nature</span>
                                </h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium leading-relaxed">
                                    Hill Tourism was born out of a simple desire: to bridge the gap between soulful travel and premium comfort. In a world that's always moving, we offer a place to stop, breathe, and belong.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                                    <h4 className="text-4xl font-black text-primary-600 tracking-tighter mb-1">250+</h4>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Premium Stays</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                                    <h4 className="text-4xl font-black text-primary-600 tracking-tighter mb-1">15k+</h4>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Happy Travelers</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary-500/10 blur-3xl rounded-full" />
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[500px]">
                                <Image
                                    src="https://images.unsplash.com/photo-1518005020250-eccdd5f1d954?q=80&w=2002&auto=format&fit=crop"
                                    alt="Luxury interior"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-neutral-900 text-white px-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-500/10 blur-[120px] rounded-full" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic-none">
                            Our Core <span className="text-primary-500">Values</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-primary-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {VALUES.map((value, idx) => (
                            <div key={idx} className="group p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
                                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <value.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{value.title}</h3>
                                <p className="text-neutral-400 font-medium leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Travel Experience Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">
                            Experience the <span className="text-primary-600">Extraordinary</span>
                        </h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg font-medium">
                            Whether it's a silent mountain morning, a sunset by the river, or a walk through ancient tea estates—we've mapped them all for you.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { icon: Mountain, label: 'Alpine Escapes' },
                            { icon: Waves, label: 'Riverside Gems' },
                            { icon: Leaf, label: 'Heritage Estates' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm">
                                <item.icon className="w-5 h-5 text-primary-600" />
                                <span className="font-black uppercase tracking-tight text-xs text-neutral-800 dark:text-neutral-200">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Link href="/properties">
                            <Button size="lg" className="rounded-full px-12 py-8 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/20">
                                Start Your Journey <ArrowRight className="ml-3 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

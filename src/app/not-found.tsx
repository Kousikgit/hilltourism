"use client";

import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-neutral-950 p-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
                <Compass className="w-32 h-32 text-emerald-500 relative z-10 animate-pulse" />
            </div>

            <h1 className="text-8xl font-black text-neutral-900 dark:text-white tracking-tighter mb-4">404</h1>
            <h2 className="text-2xl font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest mb-6">Expedition Lost in Space</h2>

            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-12 text-lg font-medium leading-relaxed">
                It seems you've wandered off the trail. The destination you're looking for doesn't exist or has moved to a new coordinate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    variant="primary"
                    className="rounded-full px-10 py-6 h-auto font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20"
                    onClick={() => window.location.href = '/'}
                >
                    <Home className="w-5 h-5" />
                    Back to Base Camp
                </Button>
                <Button
                    variant="glass"
                    className="rounded-full px-10 py-6 h-auto font-black uppercase tracking-widest flex items-center gap-3"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Previous Trail
                </Button>
            </div>

            <div className="mt-24">
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.5em]">Hill Tourism | Exploration Agency</p>
            </div>
        </div>
    );
}

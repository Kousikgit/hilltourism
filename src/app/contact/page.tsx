'use client';

import { ContactSection } from "@/components/ContactSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Internal Page Header */}
                <div className="mb-12 px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors font-bold text-[10px] uppercase tracking-[0.2em] group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-900/50 rounded-[3rem] border border-neutral-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <ContactSection />
                </div>
            </div>
        </main>
    );
}

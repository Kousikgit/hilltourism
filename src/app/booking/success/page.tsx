"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    return (
        <div className="pt-40 pb-24 px-4 max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Booking Confirmed!</h1>
            <p className="text-neutral-600 text-lg mb-12">
                Thank you for choosing StayEase. Your booking (ID: {id}) has been successfully confirmed.
                A confirmation email and WhatsApp message have been sent to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push('/')} variant="outline" className="rounded-2xl py-4 px-8 flex gap-2">
                    <Home className="w-5 h-5" /> Back to Home
                </Button>
                <Button onClick={() => router.push('/properties')} className="rounded-2xl py-4 px-8 flex gap-2">
                    Explore More Stays <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div className="pt-40 text-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}

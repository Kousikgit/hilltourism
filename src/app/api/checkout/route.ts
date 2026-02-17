import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const stripe = getStripe();
        if (!stripe) {
            throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
        }
        const { amount, bookingId, propertyName } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Booking: ${propertyName}`,
                        },
                        unit_amount: amount * 100, // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/booking/success?id=${bookingId}`,
            cancel_url: `${req.headers.get('origin')}/properties/${bookingId}`,
            metadata: {
                bookingId,
            },
        });

        return NextResponse.json({ id: session.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

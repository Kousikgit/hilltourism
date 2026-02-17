import Stripe from 'stripe';

export function getStripe() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) return null;

    return new Stripe(stripeSecretKey, {
        apiVersion: '2025-01-27-acacia' as any,
    });
}

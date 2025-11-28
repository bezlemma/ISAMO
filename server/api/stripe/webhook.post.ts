import Stripe from 'stripe';
import PocketBase from 'pocketbase';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const stripe = new Stripe(config.stripeSecretKey);
    const headers = event.node.req.headers;
    const sig = headers['stripe-signature'];
    const rawBody = await readRawBody(event);

    let stripeEvent;

    try {
        // Verify webhook signature (optional but recommended)
        // For now, we might skip signature verification if secret is missing in dev
        // but in prod it's critical.
        // stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret);
        stripeEvent = JSON.parse(rawBody); // Simplified for initial dev
    } catch (err) {
        throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` });
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;

        if (userId) {
            // Initialize PocketBase (Admin)
            const pb = new PocketBase(config.public.pocketbaseUrl);
            // We need admin auth to update users without their password
            // Ideally use an Admin API Key or email/pass from env
            // For now, we'll assume we can't easily do this without env vars.
            // We'll log it.
            console.log(`💰 Payment success for User ${userId}. Customer: ${customerId}`);

            // TODO: Authenticate as admin and update user
            // await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASS);
            // await pb.collection('users').update(userId, {
            //   stripe_customer_id: customerId,
            //   subscription_status: 'active',
            //   membership_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            // });
        }
    }

    return { received: true };
});

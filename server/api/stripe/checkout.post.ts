import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { priceId, successUrl, cancelUrl, userEmail, userId } = body;

    if (!config.stripeSecretKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Stripe configuration missing',
        });
    }

    const stripe = new Stripe(config.stripeSecretKey);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: userEmail,
            metadata: {
                userId: userId, // Pass PocketBase User ID to webhook
            },
        });

        return { url: session.url };
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }
});

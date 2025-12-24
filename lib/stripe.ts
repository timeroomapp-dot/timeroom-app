import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
};

export const createPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
  });
  return session;
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return { subscriptionStatus: 'active' };

    case 'customer.subscription.deleted':
      return { subscriptionStatus: 'cancelled' };

    case 'invoice.payment_succeeded':
      return { status: 'payment_succeeded' };

    case 'invoice.payment_failed':
      return { status: 'payment_failed' };

    default:
      return null;
  }
};

export const verifyWebhookSignature = (
  body: string,
  signature: string | string[] | undefined,
  secret: string
): Stripe.Event | null => {
  if (typeof signature !== 'string') {
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, secret) as Stripe.Event;
  } catch (err) {
    return null;
  }
};

import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  const event = verifyWebhookSignature(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!event) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Handle the event
  const result = await handleWebhookEvent(event);

  if (!result) {
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  }

  // TODO: Update user subscription status in database
  // if (result.subscriptionStatus) {
  //   await updateUserSubscriptionStatus(event.data.object.customer, result.subscriptionStatus);
  // }

  return NextResponse.json(
    { received: true, processed: result },
    { status: 200 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}

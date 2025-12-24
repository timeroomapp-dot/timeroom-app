# Stripe Integration Guide for Timeroom

## Overview

Timeroom uses Stripe for payment processing, enabling secure credit card transactions and subscription management. This guide outlines the setup and implementation details for developers.

## Credentials Setup

### Test Mode Keys

The Stripe API keys are configured in the `.env` file:

```env
STRIPE_PUBLIC_KEY=pk_test_51SffjA2aiwdzP36COERkqI2MEPvRMiBxRlNxw9AEw6oezmMxC6jq6eMwWFETqiVGnX5oel5OdAfMCdArzy2bqAip00t5ucyAU0
STRIPE_SECRET_KEY=sk_test_51SffjA2aiwdzP36C4oaxo4cRc6FEXLDAoVLEIxkwNHV5e1LcmIfmixfusXGUFd93fzom8i1aGkdedxFaHPLpClAP00QjbYFou
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SffjA2aiwdzP36COERkqI2MEPvRMiBxRlNxw9AEw6oezmMxC6jq6eMwWFETqiVGnX5oel5OdAfMCdArzy2bqAip00t5ucyAU0
STRIPE_WEBHOOK_SECRET=whsec_test_[your_webhook_secret]
```

### Environment Variables

- **STRIPE_PUBLIC_KEY**: Publishable key for client-side operations (safe to expose)
- **STRIPE_SECRET_KEY**: Secret key for server-side operations (keep private)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Public key for Next.js client components
- **STRIPE_WEBHOOK_SECRET**: Secret for validating webhook signatures

## Webhook Setup

### Local Development Testing

For testing webhooks during development, use the Stripe CLI:

```bash
# 1. Install and login to Stripe CLI
stripe login

# 2. Forward webhook events to your local endpoint
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# 3. Trigger test events
stripe trigger payment_intent.succeeded
```

### Production Deployment

When deploying to production:

1. Navigate to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your production webhook URL (e.g., `https://yourdomain.com/api/stripe/webhooks`)
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `invoice.payment_succeeded`
5. Copy the webhook signing secret and add to `.env.production`

## Implementation

### Backend Integration

The Stripe webhook handler is implemented in `app/api/stripe/webhooks/route.ts`:

```typescript
// Validates webhook signature
// Processes payment events
// Updates database records
// Handles subscriptions and refunds
```

### Frontend Integration

The Stripe library is imported in `lib/stripe.ts` and used for:

- Payment intent creation
- Token generation
- Subscription management
- Customer data handling

## Testing

### Test Card Numbers

Stripe provides test card numbers for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Authentication Required**: `4000 0027 6000 3184`

Use any future expiration date and any 3-digit CVC.

### Testing Webhooks

Test webhook events using:

```bash
stripe trigger charge.succeeded
stripe trigger charge.failed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

## Security Best Practices

1. **Keep secrets private**: Never commit `.env` files with live keys
2. **Use environment variables**: Store credentials in `.env.production` for live deployments
3. **Validate webhooks**: Always verify webhook signatures using the signing secret
4. **PCI Compliance**: Never handle raw card data; use Stripe's secure methods
5. **HTTPS Only**: Webhooks must use HTTPS endpoints in production
6. **Rate Limiting**: Implement rate limiting on webhook endpoints (configured in middleware.ts)

## Migration to Live Keys

When ready for production:

1. Create a live Stripe account or switch to live mode
2. Generate live API keys from Stripe Dashboard
3. Update environment variables in production deployment
4. Set up live webhook endpoints
5. Test with real transactions before full launch

## Troubleshooting

### Webhook Not Firing
- Verify webhook endpoint is publicly accessible
- Check that HTTPS is enabled
- Review Stripe Dashboard > Developers > Webhooks > Event Log
- Ensure signing secret is correctly configured

### Payment Processing Fails
- Verify API keys are correct
- Check customer/payment intent creation
- Review Stripe Dashboard > Transactions > Payments
- Check middleware rate limiting isn't blocking requests

### Signature Validation Fails
- Confirm webhook secret is correct
- Verify raw request body is used (not parsed)
- Check timestamp is within reasonable range

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Testing](https://stripe.com/docs/testing)

## Support

For issues or questions:
1. Check Stripe Dashboard for detailed logs
2. Review integration guide in SETUP.md
3. Contact Stripe Support: support@stripe.com

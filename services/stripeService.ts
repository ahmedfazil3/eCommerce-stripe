import { PaymentIntentResponse } from '../types/checkout';

const FUNCTIONS_URL =
  process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ||
  'https://iwyefhdsirtxulgumwoo.supabase.co/functions/v1';

export const stripeService = {
  // Call the Supabase Edge Function to create a PaymentIntent
  async createPaymentIntent(
    amount: number, // in cents (e.g. $10.00 = 1000)
    currency: string = 'usd',
    email?: string,
    customerName?: string
  ): Promise<PaymentIntentResponse> {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency: currency.toLowerCase(),
          email,
          customerName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create PaymentIntent';
        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        paymentIntent: data.paymentIntent,
        ephemeralKey: data.ephemeralKey,
        customer: data.customer,
        publishableKey: data.publishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      };
    } catch (error: any) {
      console.warn('Stripe PaymentIntent request failed:', error.message);
      throw error;
    }
  },
};
export default stripeService;

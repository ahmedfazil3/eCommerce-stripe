export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  orderNotes?: string;
}

export interface PaymentIntentResponse {
  paymentIntent: string; // Stripe client secret
  ephemeralKey?: string;
  customer?: string;
  publishableKey: string;
}

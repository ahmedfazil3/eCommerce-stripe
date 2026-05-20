import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get request body
    const { amount, currency, email, customerName } = await req.json();

    if (!amount || !currency) {
      return new Response(JSON.stringify({ error: "Missing amount or currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Create or find customer (optional, but recommended for saving cards / Stripe PaymentSheet flow)
    let customerId;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: customerName || undefined,
        });
        customerId = customer.id;
      }
    }

    // 3. Create Stripe Ephemeral Key for customer (enables seamless UI payment sheet loading)
    let ephemeralKey;
    if (customerId) {
      ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2023-10-16" }
      );
    }

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_email: email || "unknown",
      },
    });

    // 5. Return keys
    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey ? ephemeralKey.secret : undefined,
        customer: customerId,
        publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
// Minimal Express + Stripe Checkout example
// Save as server/stripe-checkout.js and set environment variable STRIPE_SECRET_KEY

/*
  Usage:
    npm install express stripe body-parser
    STRIPE_SECRET_KEY=sk_test_... node server/stripe-checkout.js

  This example creates a Checkout session for a subscription or one-time purchase.
  It is a template — adapt prices and products to your Stripe account.
*/

const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('WARNING: STRIPE_SECRET_KEY is not set — this server will not function until you provide it.');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const app = express();
app.use(bodyParser.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    // Example: use price ID from your Stripe dashboard
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // or 'payment' for one-time
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  // handle webhook events here and verify signature
  res.status(200).send('ok');
});

app.listen(4242, () => console.log('Stripe demo server running on port 4242'));

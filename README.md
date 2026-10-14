# Glow & Grace

This repository contains a static demo site for a beauty and style guide. I added client-side features to support:

- Save favourites (localStorage)
- Share palettes (URL + Web Share API)
- Live look preview
- Cart with download options (JSON, PDF via jsPDF)
- Demo subscription gating (localStorage flag) and subscribe modal
- Theme (light/dark) toggle

Important notes about payments and subscriptions

- This project includes a client-side demo for subscription behavior (localStorage flag). For a production-ready subscription flow you must integrate a payment provider such as Stripe and run a server-side component to create checkout sessions and verify payments.

- See the /server example for a minimal Express + Stripe Checkout template. Do not commit your Stripe secret key to the repository. Deploy the server to a secure environment (Vercel, Heroku, Render) and set secrets through environment variables.

Next steps I can implement for you:

- Wire up Stripe Checkout + webhooks and protect the download/usage endpoints by checking subscription status.
- Add user accounts (Auth0, Firebase Auth, or custom) so purchases are tied to users rather than localStorage.
- Add a small database (Supabase, Firebase, or Postgres) to store favourites server-side and sync across devices.
- Add product suggestions and a real cart checkout flow (purchase physical products or affiliate links).

Tell me which of the next steps you'd like me to implement and I will add server code and deployment instructions, or implement the Stripe integration for you (you will need to provide keys or deploy and set them yourself).
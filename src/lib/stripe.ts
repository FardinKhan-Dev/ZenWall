import Stripe from "stripe";

/**
 * Singleton Stripe server-side client.
 * Always used in API routes only — never on the client side.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

/** Credit packages available for purchase */
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    credits: 20,
    price: 299,        // in cents ($2.99)
    label: "Starter",
    popular: false,
  },
  {
    id: "creator",
    credits: 60,
    price: 699,        // $6.99
    label: "Creator",
    popular: true,
  },
  {
    id: "pro",
    credits: 150,
    price: 1499,       // $14.99
    label: "Pro",
    popular: false,
  },
] as const;

export type PackageId = (typeof CREDIT_PACKAGES)[number]["id"];

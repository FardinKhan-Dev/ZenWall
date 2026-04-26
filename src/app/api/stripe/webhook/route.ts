import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Supabase admin client for privileged credit updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event;
  try {
    // Verify the event came from Stripe — not a forged request
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Webhook Signature Error]", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Only handle successful payment completions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    if (!userId || credits <= 0) {
      console.error("[Webhook] Missing metadata", session.metadata);
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    // Atomically add credits to the user's profile
    const { error } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId,
      p_amount: credits,
    });

    if (error) {
      console.error("[Webhook] Failed to add credits:", error.message);
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 });
    }

    console.log(`[Webhook] Granted ${credits} credits to user ${userId}`);
  }

  return NextResponse.json({ received: true });
}

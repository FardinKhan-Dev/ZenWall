import { NextRequest, NextResponse } from "next/server";
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { packageId } = await req.json();

    // 1. Validate the package
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // 2. Get user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the JWT and get the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ZenWall — ${pkg.label} Pack`,
              description: `${pkg.credits} AI wallpaper generation credits`,
              images: [],
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      // Pass user_id and credits in metadata so the webhook can grant them
      metadata: {
        user_id: user.id,
        credits: pkg.credits.toString(),
        package_id: pkg.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe Checkout Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

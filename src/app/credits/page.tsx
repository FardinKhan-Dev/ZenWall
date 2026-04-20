"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSparklingLine, RiCheckLine, RiCoinLine,
  RiFlashlightLine, RiShieldCheckLine, RiLeafLine
} from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { CREDIT_PACKAGES } from "@/lib/stripe";

export default function CreditsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, credits, isHydrated, initialize } = useAuthStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "cancel"; msg: string } | null>(null);

  // Auth guard
  useEffect(() => {
    if (isHydrated && !user) router.push("/auth");
  }, [isHydrated, user, router]);

  // Handle redirect back from Stripe
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setBanner({ type: "success", msg: "🎉 Payment successful! Your credits have been added." });
      initialize(); // Re-fetch credits from DB
    } else if (searchParams.get("cancelled") === "true") {
      setBanner({ type: "cancel", msg: "Payment cancelled. No charges were made." });
    }
  }, [searchParams, initialize]);

  const handlePurchase = async (packageId: string) => {
    if (!user) return;
    setLoadingId(packageId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to Stripe hosted checkout page
      window.location.href = data.url;
    } catch (err: any) {
      setBanner({ type: "cancel", msg: err?.message || "Something went wrong." });
      setLoadingId(null);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2"
        >
          <RiCoinLine />
          Current Balance: {credits} credits
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-foreground"
        >
          Top Up Your Credits
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-foreground/55 max-w-md"
        >
          Each image generation costs 1 credit. Choose a pack below — no subscription, no recurring fees.
        </motion.p>
      </div>

      {/* Success / Cancel Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
              banner.type === "success"
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "bg-orange-50 border border-orange-200 text-orange-600"
            }`}
          >
            {banner.type === "success" ? <RiCheckLine className="text-xl" /> : <RiSparklingLine />}
            {banner.msg}
            <button onClick={() => setBanner(null)} className="ml-auto font-bold opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
              pkg.popular
                ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-105"
                : "border-border/30 bg-card hover:border-primary/30 hover:shadow-lg"
            }`}
          >
            {/* Popular badge */}
            {pkg.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>
            )}

            <div className="flex flex-col gap-5 flex-grow">
              {/* Icon & Name */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pkg.popular ? "bg-primary" : "bg-secondary"}`}>
                  <RiLeafLine className={pkg.popular ? "text-white" : "text-primary"} />
                </div>
                <span className="font-bold text-lg">{pkg.label}</span>
              </div>

              {/* Credits */}
              <div>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">
                  {pkg.credits}
                  <span className="text-lg font-semibold text-foreground/50 ml-1">credits</span>
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  ${(pkg.price / 100 / pkg.credits).toFixed(3)} per image
                </p>
              </div>

              {/* What you get */}
              <ul className="flex flex-col gap-2 text-sm text-foreground/70">
                <li className="flex items-center gap-2"><RiCheckLine className="text-primary flex-shrink-0" /> {pkg.credits} AI wallpaper generations</li>
                <li className="flex items-center gap-2"><RiCheckLine className="text-primary flex-shrink-0" /> Stored in your history</li>
                <li className="flex items-center gap-2"><RiCheckLine className="text-primary flex-shrink-0" /> Download in high resolution</li>
              </ul>
            </div>

            {/* CTA */}
            <button
              id={`buy-${pkg.id}`}
              onClick={() => handlePurchase(pkg.id)}
              disabled={!!loadingId}
              className={`mt-7 w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                pkg.popular
                  ? "bg-primary text-white hover:scale-[1.02] active:scale-[0.98] glow shadow-md"
                  : "border border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              {loadingId === pkg.id ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Redirecting...</>
              ) : (
                <><RiFlashlightLine /> Buy for ${(pkg.price / 100).toFixed(2)}</>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-foreground/40 pt-4">
        <div className="flex items-center gap-2"><RiShieldCheckLine className="text-primary" /> Secured by Stripe</div>
        <div className="flex items-center gap-2"><RiCheckLine className="text-primary" /> No subscription</div>
        <div className="flex items-center gap-2"><RiCoinLine className="text-primary" /> Credits never expire</div>
      </div>
    </div>
  );
}

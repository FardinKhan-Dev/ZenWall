"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSparklingLine,
  RiCheckLine,
  RiCoinLine,
  RiFlashlightLine,
  RiShieldCheckLine,
  RiLeafLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import { toast } from "sonner";

import { Suspense } from "react";

function CreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, credits, isHydrated, initialize } = useAuthStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Handle redirect back from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");

    if (success === "true") {
      toast.success("Payment Successful!", {
        description: "Your credits have been added to your balance.",
      });
      initialize(); // Re-fetch credits from DB
    } else if (cancelled === "true") {
      toast.info("Payment Cancelled", {
        description: "No charges were made.",
      });
    }
  }, [searchParams, initialize]);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      router.push(`/auth?redirect=/credits`);
      return;
    }
    setLoadingId(packageId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.url) {
        toast.info("Redirecting to Stripe...", {
          description: "Please complete your purchase on the secure checkout page.",
        });
        window.location.assign(data.url);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Checkout Error", {
        description: error?.message || "Failed to initiate payment.",
      });
      setLoadingId(null);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Navigation */}
      <div className="flex justify-start">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-foreground/60 hover:text-foreground font-bold transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <RiArrowLeftLine size={20} />
          </div>
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-4">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2"
          >
            <RiCoinLine />
            Current Balance: {credits} credits
          </motion.div>
        )}

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
          Each image generation costs 1 credit. Choose a pack below — no subscription, no recurring
          fees.
        </motion.p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            {pkg.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>
            )}

            <div className="flex flex-col gap-5 grow">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${pkg.popular ? "bg-primary" : "bg-secondary"}`}
                >
                  <RiLeafLine className={pkg.popular ? "text-white" : "text-primary"} />
                </div>
                <span className="font-bold text-lg">{pkg.label}</span>
              </div>

              <div>
                <p className="text-4xl font-extrabold text-foreground tracking-tight">
                  {pkg.credits}
                  <span className="text-lg font-semibold text-foreground/50 ml-1">credits</span>
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  {pkg.price === 0
                    ? "Initial balance"
                    : `$${(pkg.price / 100 / pkg.credits).toFixed(3)} per image`}
                </p>
              </div>

              <ul className="flex flex-col gap-2 text-sm text-foreground/70">
                <li className="flex items-center gap-2">
                  <RiCheckLine className="text-primary shrink-0" /> {pkg.credits} AI wallpaper
                  generations
                </li>
                <li className="flex items-center gap-2">
                  <RiCheckLine className="text-primary shrink-0" /> Stored in your history
                </li>
                <li className="flex items-center gap-2">
                  <RiCheckLine className="text-primary shrink-0" /> Download in high resolution
                </li>
              </ul>
            </div>

            <button
              id={`buy-${pkg.id}`}
              onClick={() => {
                if (pkg.price === 0) {
                  router.push("/auth?mode=signup");
                } else {
                  handlePurchase(pkg.id);
                }
              }}
              disabled={!!loadingId || (pkg.price === 0 && !!user)}
              className={`mt-7 w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                pkg.popular
                  ? "bg-primary text-white hover:scale-[1.02] active:scale-[0.98] glow shadow-md"
                  : pkg.price === 0 && user
                    ? "bg-secondary/40 text-foreground/40 border border-border/20"
                    : "border border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              {loadingId === pkg.id ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>{" "}
                  Redirecting...
                </>
              ) : pkg.price === 0 ? (
                user ? (
                  "Current Plan"
                ) : (
                  "Get Started"
                )
              ) : (
                <>
                  <RiFlashlightLine /> Buy for ${(pkg.price / 100).toFixed(2)}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-foreground/40 pt-4">
        <div className="flex items-center gap-2">
          <RiShieldCheckLine className="text-primary" /> Secured by Stripe
        </div>
        <div className="flex items-center gap-2">
          <RiCheckLine className="text-primary" /> No subscription
        </div>
        <div className="flex items-center gap-2">
          <RiCoinLine className="text-primary" /> Credits never expire
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-primary"
          >
            <RiSparklingLine size={40} />
          </motion.div>
        </div>
      }
    >
      <CreditsContent />
    </Suspense>
  );
}

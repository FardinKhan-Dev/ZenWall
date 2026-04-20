"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RiMagicLine, RiImageLine, RiWindyLine,
  RiDownloadLine, RiSparklingLine, RiLeafLine, RiAlertLine
} from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";

const PRESETS = [
  "Zen garden in morning mist",
  "Minimalist pine forest, geometric",
  "Soft watercolor meadow at golden hour",
  "Ethereal mountain peaks, line art style",
];

const SUPABASE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-wallpaper`
  : "";

export default function Home() {
  const router = useRouter();
  const { user, isHydrated, deductCredit } = useAuthStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to auth if not logged in (only after hydration)
  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/auth");
    }
  }, [isHydrated, user, router]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !user) return;

    setError(null);
    setGeneratedUrl(null);
    setIsGenerating(true);

    try {
      // Get the current session JWT for the Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please sign in again.");

      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 402 = Insufficient credits
        if (res.status === 402) throw new Error("You're out of credits. Purchase more to continue generating.");
        throw new Error(data.error || "Generation failed. Please try again.");
      }

      setGeneratedUrl(data.imageUrl);
      deductCredit(); // Optimistically update the credit count in the UI
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedUrl) return;
    const res = await fetch(generatedUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zenwall-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show nothing while hydrating to avoid flash
  if (!isHydrated) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">

      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2"
        >
          <RiSparklingLine />
          Powered by Gemini Imagen 4
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl"
        >
          Generate Your <span className="text-primary italic">Perfect</span> Peace.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-foreground/60 max-w-xl"
        >
          Describe your dream wallpaper. We&apos;ll generate a high-resolution masterpiece in seconds.
        </motion.p>
      </section>

      {/* Generator Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl p-3 md:p-4 border border-border/30 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="A misty forest with soft morning light..."
            disabled={isGenerating}
            className="flex-grow w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-5 placeholder:text-foreground/25 text-foreground font-medium disabled:opacity-50"
          />
          <button
            id="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full md:w-auto bg-primary text-white px-8 py-5 rounded-2xl text-base font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 glow"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <RiWindyLine className="text-xl" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-border/20 mt-1">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              disabled={isGenerating}
              className="text-xs font-semibold bg-secondary/50 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all border border-primary/10 disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-5 py-4 rounded-2xl -mt-6"
          >
            <RiAlertLine className="text-lg flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-video rounded-3xl bg-secondary/30 border border-border/20 flex flex-col items-center justify-center gap-4 -mt-4"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center animate-pulse">
              <RiLeafLine className="text-primary text-3xl" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">AI is painting your wallpaper...</p>
              <p className="text-sm text-foreground/50 mt-1">This usually takes 10–20 seconds</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Result */}
      <AnimatePresence>
        {generatedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 -mt-4"
          >
            <div className="relative rounded-3xl overflow-hidden border border-border/20 shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedUrl}
                alt={prompt}
                className="w-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                <button
                  id="download-btn"
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/90 text-foreground px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm hover:bg-white transition-all shadow-lg"
                >
                  <RiDownloadLine className="text-primary" />
                  Download Wallpaper
                </button>
              </div>
            </div>
            <p className="text-xs text-foreground/40 text-center">
              Prompt: &ldquo;{prompt}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features (only show when no result) */}
      {!generatedUrl && !isGenerating && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {[
            { icon: <RiImageLine />, title: "High Resolution", desc: "Generated in crystal-clear quality, ready for any screen." },
            { icon: <RiMagicLine />, title: "Gemini Imagen 4", desc: "Google's latest image model for photorealistic & artistic results." },
            { icon: <RiLeafLine />, title: "Stored Forever", desc: "Access all your generated wallpapers from your history anytime." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-7 rounded-3xl bg-secondary/30 border border-primary/10 flex flex-col gap-3"
            >
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                {f.icon}
              </div>
              <h3 className="font-bold text-base">{f.title}</h3>
              <p className="text-sm text-foreground/55 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}

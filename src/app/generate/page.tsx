"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { RiMagicLine, RiDownloadLine, RiSparklingLine, RiLeafLine } from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { toast } from "sonner";

const promptSchema = z
  .string()
  .min(3, "Prompt is too short. Try to describe more details.")
  .max(500, "Prompt is too long. Keep it under 500 characters.");

const PRESETS = [
  "Zen garden in morning mist",
  "Minimalist pine forest, geometric",
  "Soft watercolor meadow at golden hour",
  "Ethereal mountain peaks, line art style",
];

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isHydrated, deductCredit } = useAuthStore();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  // Check for pre-filled prompt from landing page
  useEffect(() => {
    const prefilled = searchParams.get("prompt");
    if (prefilled) {
      queueMicrotask(() => {
        setPrompt(prefilled);
      });
    }
  }, [searchParams]);

  // Auth guard: Redirect to landing if not logged in after hydration
  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/");
    }
  }, [isHydrated, user, router]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || cooldown || !user) return;

    // Validate with Zod
    const validation = promptSchema.safeParse(prompt.trim());
    if (!validation.success) {
      toast.error("Invalid Prompt", {
        description: validation.error.issues[0].message,
      });
      return;
    }
    setGeneratedUrl(null);
    setIsGenerating(true);
    setCooldown(true);

    // Auto-release cooldown after 3 seconds
    setTimeout(() => setCooldown(false), 3000);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please sign in again.");

      const { data, error: funcError } = await supabase.functions.invoke("generate-wallpaper", {
        body: { prompt: prompt.trim() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
      });

      if (funcError) {
        // Safe check for status without using 'any'
        const isInsufficientCredits =
          funcError.message?.includes("Insufficient credits") ||
          (funcError instanceof Error && (funcError as { status?: number }).status === 402);

        toast.error("Generation Failed", {
          description: isInsufficientCredits ? "You're out of credits." : funcError.message,
        });
        setIsGenerating(false);
        return;
      }

      setGeneratedUrl(data.imageUrl);
      deductCredit();
      toast.success("Masterpiece Ready!", {
        description: "Your atmospheric wallpaper has been saved to the vault.",
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Error", {
        description: error?.message || "Something went wrong.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedUrl) return;
    toast.info("Preparing Download...", {
      description: "Optimizing your high-res wallpaper.",
    });
    try {
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zenwall-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download Started!");
    } catch (err) {
      toast.error("Download Failed");
    }
  };

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    profile?.first_name ||
    user?.email?.split("@")[0] ||
    "Friend";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Show a clean loading state if we're not hydrated yet
  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl space-y-12">
        {/* Celestial Greeting */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
              <RiSparklingLine className="text-2xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h2 className="text-xl md:text-2xl font-medium text-muted-foreground">
              {greeting}, <span className="text-primary capitalize">{firstName}</span>
            </h2>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Create your <br /> next <span className="text-primary italic">Atmoshere</span>
            </h1>
          </motion.div>
        </div>

        {/* Pill-shaped Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
          <div className="relative flex items-center bg-secondary/80 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-2 pl-6 shadow-2xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="A quiet mountain lake at night..."
              disabled={isGenerating}
              className="grow bg-transparent border-none outline-none ring-0 focus:ring-0 text-lg py-3 placeholder:text-muted-foreground/40 text-foreground font-medium disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <RiMagicLine className="text-2xl" />
            </button>
          </div>
        </motion.div>

        {/* Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/40 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all disabled:opacity-40"
            >
              <RiLeafLine className="text-primary/70" />
              {p}
            </button>
          ))}
        </motion.div>

        {/* Display Result or Error - Handled by Toast */}

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full aspect-video rounded-3xl bg-secondary/30 border border-border/20 flex flex-col items-center justify-center gap-4 shadow-inner"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-foreground/70 tracking-wide uppercase">
              Painting Excellence...
            </p>
          </motion.div>
        )}

        {generatedUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden border border-border/20 shadow-2xl group ring-1 ring-white/5 aspect-video">
              <Image
                src={generatedUrl}
                alt={prompt}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-end p-6 md:p-10 opacity-0 group-hover:opacity-100">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <RiDownloadLine className="text-xl" />
                  Download Masterpiece
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <footer className="pt-20 text-center text-sm text-foreground/40 border-t border-border/10">
        © {new Date().getFullYear()} ZenWall · AI-Powered Wallpapers
      </footer>
    </div>
  );
}

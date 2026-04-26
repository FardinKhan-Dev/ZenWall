"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import {
  RiArrowLeftLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiShareLine,
  RiSparklingLine,
} from "react-icons/ri";
import { motion } from "framer-motion";

interface Wallpaper {
  id: string;
  image_url: string;
  prompt: string;
}

export default function WallpaperDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { deleteWallpaper } = useAuthStore();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchWallpaper() {
      if (!id) return;

      const { data, error } = await supabase.from("wallpapers").select("*").eq("id", id).single();

      if (error || !data) {
        console.error("Error fetching wallpaper:", error);
        router.push("/dashboard");
        return;
      }

      setWallpaper(data);
      setIsLoading(false);
    }

    fetchWallpaper();
  }, [id, router]);

  const handleDownload = async () => {
    if (!wallpaper) return;
    const res = await fetch(wallpaper.image_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zenwall-${wallpaper.id}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!wallpaper || !confirm("Are you sure you want to delete this masterpiece?")) return;
    setIsDeleting(true);
    try {
      await deleteWallpaper(wallpaper.id);
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (!wallpaper) return;
    navigator.clipboard.writeText(wallpaper.image_url);
    alert("Image link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <RiSparklingLine size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── TOP NAVIGATION ── */}
      <nav className="p-6 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-foreground/60 hover:text-foreground font-bold transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <RiArrowLeftLine size={20} />
          </div>
          <span>Back to Collection</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-3 rounded-xl bg-secondary text-foreground/60 hover:text-primary transition-all shadow-sm"
            title="Copy Link"
          >
            <RiShareLine size={20} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
            title="Delete Artwork"
          >
            <RiDeleteBinLine size={20} />
          </button>
        </div>
      </nav>

      {/* ── MAIN VIEWER ── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-12 px-6 pb-12 max-w-7xl mx-auto w-full items-center">
        {/* Cinematic Image Container */}
        <div className="flex-1 relative group w-full aspect-video lg:aspect-auto lg:h-[70vh] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-black/40">
          {/* Ambient Blur Background */}
          <div
            className="absolute inset-0 blur-[100px] opacity-20 scale-150 pointer-events-none"
            style={{ backgroundImage: `url(${wallpaper.image_url})`, backgroundSize: "cover" }}
          />

          <Image
            src={wallpaper.image_url}
            alt={wallpaper.prompt}
            fill
            className="object-contain z-10"
            priority
          />

          {/* Floating Download Button (Desktop Overay) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
            <button
              onClick={handleDownload}
              className="pointer-events-auto bg-primary text-white px-8 py-4 rounded-3xl font-black text-lg shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-3 glow"
            >
              <RiDownloadLine /> Download 8K
            </button>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="w-full lg:w-80 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              <RiInformationLine /> Masterpiece Details
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
              Atmospheric <span className="text-primary italic">Noir</span>
            </h1>
          </div>

          <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border/20 space-y-4">
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
              Original Prompt
            </p>
            <p className="text-foreground/80 font-medium leading-relaxed italic">
              &quot;{wallpaper.prompt}&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/10">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Engine</p>
              <p className="text-sm font-bold text-foreground">ZenAI Flux.1</p>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/10">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Quality</p>
              <p className="text-sm font-bold text-foreground">Ultra 8K</p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 lg:hidden"
          >
            <RiDownloadLine /> Download 8K
          </button>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLeafLine, RiSparklingLine, RiDownloadLine, RiDeleteBinLine,
  RiUserLine, RiCoinLine, RiCalendarLine, RiImageAddLine,
  RiRefreshLine, RiAlertLine
} from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserWallpapers, deleteWallpaper } from "@/lib/wallpapers";

interface Wallpaper {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, credits, isHydrated } = useAuthStore();

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (isHydrated && !user) router.push("/auth");
  }, [isHydrated, user, router]);

  const fetchWallpapers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserWallpapers(user.id);
      setWallpapers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load your wallpapers.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isHydrated && user) fetchWallpapers();
  }, [isHydrated, user, fetchWallpapers]);

  const handleDownload = async (url: string, prompt: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `zenwall-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWallpaper(id);
      setWallpapers((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete wallpaper.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Dashboard</h1>
          <p className="text-sm text-foreground/50 mt-1">Your generated wallpaper history</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold glow hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          <RiSparklingLine />
          Generate New
        </Link>
      </div>

      {/* Profile Stats Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 border border-border/30 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {/* Avatar & Email */}
          <div className="flex items-center gap-4 sm:col-span-1">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg glow flex-shrink-0">
              <RiUserLine className="text-white text-2xl" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-foreground truncate">{user.email}</p>
              <p className="text-xs text-foreground/50">Member</p>
            </div>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-3 bg-secondary/40 rounded-2xl px-5 py-4 border border-primary/15">
            <RiCoinLine className="text-primary text-2xl flex-shrink-0" />
            <div>
              <p className="text-2xl font-extrabold text-foreground">{credits}</p>
              <p className="text-xs text-foreground/50">Credits Remaining</p>
            </div>
          </div>

          {/* Total wallpapers */}
          <div className="flex items-center gap-3 bg-secondary/40 rounded-2xl px-5 py-4 border border-primary/15">
            <RiImageAddLine className="text-primary text-2xl flex-shrink-0" />
            <div>
              <p className="text-2xl font-extrabold text-foreground">{wallpapers.length}</p>
              <p className="text-xs text-foreground/50">Wallpapers Generated</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-5 py-4 rounded-2xl"
          >
            <RiAlertLine className="text-lg flex-shrink-0" />
            {error}
            <button onClick={fetchWallpapers} className="ml-auto flex items-center gap-1 font-bold hover:underline">
              <RiRefreshLine /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden border border-border/20 animate-pulse">
              <div className="aspect-video bg-secondary/40" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 bg-secondary/60 rounded-full w-3/4" />
                <div className="h-3 bg-secondary/40 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && wallpapers.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-5 py-24 text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
            <RiLeafLine className="text-primary text-4xl" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">No wallpapers yet</p>
            <p className="text-sm text-foreground/50 mt-1">Generate your first one — it only takes a few seconds.</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm glow hover:scale-105 transition-all"
          >
            <RiSparklingLine />
            Generate My First Wallpaper
          </Link>
        </motion.div>
      )}

      {/* Wallpaper Grid */}
      {!isLoading && wallpapers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallpapers.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-3xl overflow-hidden border border-border/20 shadow-md hover:shadow-xl hover:border-primary/20 transition-all bg-card"
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={w.image_url}
                alt={w.prompt}
                className="w-full aspect-video object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4 gap-2">
                <button
                  title="Download"
                  onClick={() => handleDownload(w.image_url, w.prompt)}
                  className="flex items-center gap-1.5 bg-white/90 text-foreground px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm hover:bg-white transition-all"
                >
                  <RiDownloadLine className="text-primary" /> Download
                </button>
                <button
                  title="Delete"
                  disabled={deletingId === w.id}
                  onClick={() => handleDelete(w.id)}
                  className="flex items-center gap-1.5 bg-red-500/90 text-white px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm hover:bg-red-500 transition-all disabled:opacity-60 ml-auto"
                >
                  {deletingId === w.id ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <RiDeleteBinLine />
                  )}
                  Delete
                </button>
              </div>

              {/* Prompt & date */}
              <div className="p-4 flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                  {w.prompt}
                </p>
                <div className="flex items-center gap-1 text-xs text-foreground/40 mt-1">
                  <RiCalendarLine />
                  {formatDate(w.created_at)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

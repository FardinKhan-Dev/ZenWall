"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLeafLine,
  RiSparklingLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiUserLine,
  RiCoinLine,
  RiCalendarLine,
  RiImageAddLine,
  RiRefreshLine,
  RiAlertLine,
} from "react-icons/ri";
import Image from "next/image";
import { useAuthStore, Wallpaper } from "@/store/useAuthStore";
import { getUserWallpapers, deleteWallpaper } from "@/lib/wallpapers";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function handleDownload(url: string) {
  toast.info("Starting Download...", {
    description: "Preparing your high-res art.",
  });
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    const timestamp = Date.now();
    a.download = `zenwall-${timestamp}.png`;
    a.click();
    URL.revokeObjectURL(objectUrl);
    toast.success("Download Successful!");
  } catch (err) {
    toast.error("Download Failed");
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    credits, 
    isHydrated, 
    wallpapers, 
    setWallpapers, 
    deleteWallpaperFromStore 
  } = useAuthStore();

  // If we already have wallpapers in the store, don't show the initial big loading skeleton
  const [isLoading, setIsLoading] = useState(wallpapers.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [offset, setOffset] = useState(wallpapers.length);
  const [hasMore, setHasMore] = useState(true);

  // Auth guard
  useEffect(() => {
    if (isHydrated && !user) router.push("/auth");
  }, [isHydrated, user, router]);

  const fetchWallpapers = useCallback(
    async (isInitial = true) => {
      if (!user) return;

      if (isInitial) {
        // Only show loading if we don't have cached data
        if (wallpapers.length === 0) setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }


      try {
        const currentOffset = isInitial ? 0 : offset;
        const data = await getUserWallpapers(user.id, PAGE_SIZE, currentOffset);

        if (isInitial) {
          setWallpapers(data);
          setOffset(data.length);
        } else {
          setWallpapers([...wallpapers, ...data]);
          setOffset((prev) => prev + data.length);
        }

        setHasMore(data.length === PAGE_SIZE);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error("Fetch Error", {
          description: error?.message || "Failed to load wallpapers.",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user, offset, setWallpapers, wallpapers]
  );

  useEffect(() => {
    if (isHydrated) {
      queueMicrotask(() => {
        if (user?.id) {
          fetchWallpapers(true);
        } else {
          setIsLoading(false);
        }
      });
    }
    // We only want to fetch once on mount or when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isHydrated]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWallpaper(id);
      deleteWallpaperFromStore(id);
      toast.success("Wallpaper Deleted", {
        description: "It has been removed from your vault.",
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Deletion Failed", {
        description: error?.message || "Please try again later.",
      });
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
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
            My Collection
          </h1>
        </div>
        <Link
          href="/generate"
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
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg glow shrink-0">
              <RiUserLine className="text-white text-2xl" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-black text-foreground truncate text-lg">
                {profile?.first_name + " " + profile?.last_name || "Zen Artist"}
              </h2>
              <p className="text-xs text-foreground/60 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-3 bg-secondary/40 rounded-2xl px-5 py-4 border border-primary/15">
            <RiCoinLine className="text-primary text-2xl shrink-0" />
            <div>
              <p className="text-2xl font-extrabold text-foreground">{credits}</p>
              <p className="text-xs text-foreground/50">Credits Remaining</p>
            </div>
          </div>

          {/* Total wallpapers */}
          <div className="flex items-center gap-3 bg-secondary/40 rounded-2xl px-5 py-4 border border-primary/15">
            <RiImageAddLine className="text-primary text-2xl shrink-0" />
            <div>
              <p className="text-2xl font-extrabold text-foreground">{wallpapers.length}</p>
              <p className="text-xs text-foreground/50">Wallpapers Generated</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error - Handled by Toast */}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden border border-border/20 animate-pulse"
            >
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
      {!isLoading && wallpapers.length === 0 && (
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
            <p className="text-sm text-foreground/50 mt-1">
              Generate your first one — it only takes a few seconds.
            </p>
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
              <Link
                href={`/wallpaper/${w.id}`}
                className="relative aspect-video overflow-hidden block"
              >
                <Image
                  src={w.image_url}
                  alt={w.prompt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </Link>

              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4 gap-2 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(w.image_url);
                  }}
                  className="flex items-center gap-1.5 bg-primary text-foreground px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm hover:bg-primary/70 transition-all pointer-events-auto"
                >
                  <RiDownloadLine className="text-white" /> Download
                </button>
                <button
                  title="Delete"
                  disabled={deletingId === w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(w.id);
                  }}
                  className="flex items-center gap-1.5 bg-red-500/90 text-white px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm hover:bg-red-500 transition-all disabled:opacity-60 ml-auto pointer-events-auto"
                >
                  {deletingId === w.id ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
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
                    </svg>
                  ) : (
                    <RiDeleteBinLine />
                  )}
                  Delete
                </button>
              </div>

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

      {/* Load More */}
      {!isLoading && hasMore && wallpapers.length > 0 && (
        <div className="flex justify-center pb-10">
          <button
            onClick={() => fetchWallpapers(false)}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-8 py-3 bg-secondary/50 border border-border/40 rounded-2xl text-sm font-bold text-foreground/70 hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
          >
            {isLoadingMore ? (
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
                </svg>
                Loading more...
              </>
            ) : (
              <>
                <RiRefreshLine /> Load More Wallpapers
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

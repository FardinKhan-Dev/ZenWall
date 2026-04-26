"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RiHistoryLine,
  RiAddLine,
  RiSettings4Line,
  RiLeafLine,
  RiDashboardLine,
  RiLogoutBoxLine,
  RiLoginCircleLine,
} from "react-icons/ri";
import { FiSidebar } from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Wallpaper {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

export default function Sidebar() {
  const { user, signOut } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [history, setHistory] = useState<Wallpaper[]>([]);
  const router = useRouter();

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [user]);

  useEffect(() => {
    // Wrap in queueMicrotask to avoid synchronous cascading renders
    queueMicrotask(() => {
      if (user) {
        fetchHistory();
      } else {
        setHistory([]);
      }
    });
  }, [user, fetchHistory]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Hide sidebar on mobile when logged out
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!user && isMobile) {
    return null;
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 60 : 288 }}
      transition={{ type: "tween", duration: 0.2, ease: "circOut" }}
      className="sticky top-0 h-screen border-r border-border/20 bg-background shadow-2xl hidden md:flex flex-col z-50 overflow-hidden"
    >
      {/* Brand & Toggle */}
      <div
        className={`m-3 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
      >
        <Link
          href={user ? "/generate" : "/"}
          className="w-full p-2 flex items-center justify-center gap-2 group overflow-hidden"
        >
          <RiLeafLine
            className={`text-primary shrink-0 group-hover:rotate-12 transition-transform duration-300 ${sidebarCollapsed ? "w-12 h-12 p-3" : "w-8 h-8"}`}
          />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="font-extrabold text-2xl tracking-tighter text-foreground whitespace-nowrap"
              >
                Zen<span className="text-primary italic">Wall</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all"
          >
            <FiSidebar size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="mx-auto mb-6 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
        >
          <FiSidebar size={20} aria-hidden="true" />
        </button>
      )}

      {/* Action */}
      <div className="m-3">
        <Link
          href="/generate"
          className={`flex items-center justify-center gap-2 w-full bg-linear-to-r from-primary to-primary/80 text-white hover:scale-105 active:scale-95 transition-all font-bold text-sm shadow-lg shadow-primary/20 ${sidebarCollapsed ? "p-2 rounded-full" : "py-3.5 px-4 rounded-2xl"}`}
          aria-label="Create new wallpaper"
        >
          <RiAddLine size={20} className="shrink-0" aria-hidden="true" />
          {!sidebarCollapsed && <span>New Wallpaper</span>}
        </Link>
      </div>

      {/* Content */}
      <div
        className={`flex-1 overflow-y-auto px-6 space-y-8 mt-6 ${sidebarCollapsed ? "hidden scrollbar-none" : "scrollbar"}`}
      >
        {user ? (
          <>
            {/* History */}
            <div>
              {!sidebarCollapsed && (
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4 pl-2">
                  Recent Artworks
                </h4>
              )}
              <div className="space-y-2">
                {history.length > 0
                  ? history.map((item) => (
                      <div
                        key={item.id}
                        title={sidebarCollapsed ? item.prompt : ""}
                        className={`group rounded-2xl cursor-pointer transition-all ${sidebarCollapsed ? "p-3 flex justify-center hover:bg-primary/10" : "p-3 hover:bg-white/5 border border-transparent hover:border-border/10"}`}
                      >
                        {sidebarCollapsed ? (
                          <RiHistoryLine className="text-muted-foreground group-hover:text-primary" />
                        ) : (
                          <>
                            <p className="text-sm text-foreground/70 truncate font-medium group-hover:text-foreground">
                              {item.prompt}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    ))
                  : !sidebarCollapsed && (
                      <p className="text-xs text-muted-foreground pl-2 italic">Nothing yet...</p>
                    )}
              </div>
            </div>

            {/* Menu */}
            <div>
              {!sidebarCollapsed && (
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4 pl-2">
                  Menu
                </h4>
              )}
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-sm font-medium text-foreground/70 hover:text-foreground transition-all ${sidebarCollapsed && "justify-center"}`}
                >
                  <RiDashboardLine size={20} />
                  {!sidebarCollapsed && <span>Stats & Credits</span>}
                </Link>
                <button
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-sm font-medium text-foreground/70 hover:text-foreground transition-all text-left ${sidebarCollapsed && "justify-center"}`}
                >
                  <RiSettings4Line size={20} />
                  {!sidebarCollapsed && <span>Settings</span>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center ${sidebarCollapsed && "p-3"}`}
          >
            {!sidebarCollapsed && (
              <>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Sign in to save your masterpieces and sync history.
                </p>
                <Link
                  href="/auth"
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <RiLoginCircleLine size={16} /> Login
                </Link>
              </>
            )}
            {sidebarCollapsed && (
              <Link
                href="/auth"
                title="Login"
                className="flex items-center justify-center p-2 text-primary hover:scale-110 transition-transform"
              >
                <RiLoginCircleLine size={22} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {user && (
        <div
          className={`m-3 border-t border-border/10 ${sidebarCollapsed ? "fixed bottom-0" : ""}`}
        >
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Sign Out" : ""}
            aria-label="Sign out of your account"
            className={`w-full flex items-center justify-center gap-3 rounded-2xl bg-red-500/5 text-red-500/70 hover:bg-red-500 hover:text-white transition-all text-sm font-bold border border-red-500/10 ${sidebarCollapsed ? " p-2 rounded-full" : "py-3.5 px-4 rounded-2xl"}`}
          >
            <RiLogoutBoxLine size={20} aria-hidden="true" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </motion.aside>
  );
}

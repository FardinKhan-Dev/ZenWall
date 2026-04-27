"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { usePathname } from "next/navigation";
import {
  RiCoinLine,
  RiLogoutCircleRLine,
  RiSparklingLine,
  RiUserLine,
  RiArrowDownSLine,
  RiLeafLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const { user, credits, signOut } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isPublicRoute = pathname === "/" || pathname === "/auth" || pathname === "/credits";

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const menuItems = [
    { label: "Dashboard", icon: <RiSparklingLine />, onClick: () => router.push("/dashboard") },
    {
      label: "Sign Out",
      icon: <RiLogoutCircleRLine />,
      onClick: handleLogout,
      color: "text-red-500",
    },
  ];

  return (
    <header className="sticky top-0 w-full py-4 px-6 md:px-12 flex items-center justify-between bg-transparent backdrop-blur-xs z-50">
      {/* Brand Logo - Always visible on mobile, visible on desktop only for public routes */}
      <Link 
        href={user ? "/generate" : "/"} 
        className={`flex items-center gap-2 group ${!isPublicRoute ? "md:hidden" : ""}`}
      >
        <RiLeafLine className="text-primary text-3xl group-hover:rotate-12 transition-transform" />
        <span className="font-extrabold text-2xl tracking-tighter text-foreground">
          Zen<span className="text-primary italic">Wall</span>
        </span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Credits Pill (Now Clickable) */}
            <Link href="/credits">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-secondary/50 backdrop-blur-md border border-border/40 pl-3 pr-4 py-2 rounded-2xl shadow-sm cursor-pointer hover:bg-white/5 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <RiCoinLine className="text-primary text-xs" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  {credits} <span className="text-muted-foreground font-medium">Credits</span>
                </span>
              </motion.div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Toggle user menu"
                aria-expanded={isDropdownOpen}
                className="flex items-center gap-3 bg-secondary/50 backdrop-blur-md border border-border/40 p-2 pl-3 rounded-2xl hover:bg-white/5 transition-all text-foreground"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <RiUserLine className="text-primary text-lg" aria-hidden="true" />
                </div>
                <RiArrowDownSLine
                  className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-secondary border border-border/40 rounded-3xl shadow-2xl p-2 backdrop-blur-xl overflow-hidden"
                  >
                    {menuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick();
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold ${item.color || "text-foreground/80 hover:text-foreground"}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Link
              href="/credits"
              className="bg-primary text-white px-8 py-2.5 rounded-2xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 glow"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiLeafLine, RiSparklingLine, RiUserLine, RiLogoutBoxLine, RiCoinLine } from "react-icons/ri";
import { useAuthStore } from "@/store/useAuthStore";
import { signOut } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const { user, credits, isLoading } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass px-6 py-4 flex items-center justify-between border-b border-border/40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <RiLeafLine className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-extrabold text-xl tracking-tight text-foreground">
          Zen<span className="text-primary italic">Wall</span>
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="h-8 w-28 bg-secondary/50 rounded-full animate-pulse" />
        ) : user ? (
          <>
            {/* Credit badge */}
            <div className="flex items-center gap-1.5 bg-secondary/60 border border-primary/20 px-3 py-1.5 rounded-full">
              <RiCoinLine className="text-primary text-sm" />
              <span className="text-xs font-bold text-foreground/80">{credits}</span>
              <span className="text-xs text-foreground/40">credits</span>
            </div>

            {/* Generate CTA */}
            <Link
              href="/"
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold glow hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-primary/30"
            >
              <RiSparklingLine />
              Generate
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-1 ml-1">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <RiUserLine className="text-primary text-sm" />
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/60 text-foreground/50 hover:text-foreground transition-all"
              >
                <RiLogoutBoxLine className="text-sm" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-secondary/30"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold glow hover:scale-105 active:scale-95 transition-all"
            >
              <RiSparklingLine />
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

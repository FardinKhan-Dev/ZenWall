"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RiLeafLine } from "react-icons/ri";
import { useCreditStore } from "@/store/useCreditStore";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { credits, setCredits } = useCreditStore();

  useEffect(() => {
    const fetchUserCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Here we would fetch credits from our profiles table
        // For now, setting a mock value or using the trigger logic
        setCredits(5);
      }
    };
    fetchUserCredits();
  }, [setCredits]);

  return (
    <nav className="sticky top-0 z-50 w-full glass px-6 py-4 flex items-center justify-between border-b border-border/40">
      <Link href="/" className="flex items-center gap-2 group transition-all">
        <RiLeafLine className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-xl tracking-tight text-foreground">
          Zen<span className="text-primary italic">Wall</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-primary/20">
          <span className="text-sm font-medium text-foreground/80">Credits:</span>
          <span className="text-sm font-bold text-primary">{credits}</span>
        </div>

        <button className="text-sm font-semibold hover:text-primary transition-colors">
          Dashboard
        </button>
        
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold glow hover:scale-105 active:scale-95 transition-all">
          Generate
        </button>
      </div>
    </nav>
  );
}

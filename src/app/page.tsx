"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RiMagicLine, RiImageLine, RiWindyLine } from "react-icons/ri";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const presets = [
    "Zen garden in morning mist",
    "Minimalist pine forest, geometric",
    "Soft watercolor meadow",
    "Ethereal mountain peaks, line art",
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-12">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2"
        >
          <RiMagicLine />
          AI-Powered Serenity
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl"
        >
          Generate Your <span className="text-secondary italic">Perfect</span> Peace.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-foreground/70 max-w-2xl"
        >
          Describe your dream wallpaper and let our AI craft a high-resolution masterpiece for your desktop or mobile.
        </motion.p>
      </section>

      {/* Generator Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl p-2 md:p-4 glow group"
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-grow w-full relative">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A minimalist forest with soft sunlight..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl px-4 py-6 placeholder:text-foreground/30 text-foreground font-medium"
            />
          </div>
          <button className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/20 group-hover:px-12">
            <RiWindyLine className="text-2xl" />
            Generate
          </button>
        </div>

        {/* Presets */}
        <div className="px-4 py-4 flex flex-wrap gap-2 border-t border-border/20 mt-2">
          {presets.map((p, i) => (
            <button 
              key={i}
              onClick={() => setPrompt(p)}
              className="text-xs font-semibold bg-secondary/50 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all border border-primary/10"
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="p-8 rounded-3xl bg-secondary/30 border border-primary/10 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            <RiImageLine />
          </div>
          <h3 className="font-bold text-xl">High Resolution</h3>
          <p className="text-foreground/60 leading-relaxed">Generated in crystal clear 4K resolution, perfectly optimized for any screen size.</p>
        </div>
        
        <div className="p-8 rounded-3xl bg-secondary/30 border border-primary/10 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            <RiWindyLine />
          </div>
          <h3 className="font-bold text-xl">Style Profiles</h3>
          <p className="text-foreground/60 leading-relaxed">Choose from dozens of preset styles: Minimalism, Watercolor, Cyberpunk, or Realistic.</p>
        </div>

        <div className="p-8 rounded-3xl bg-secondary/30 border border-primary/10 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            <RiLeafLine className="text-white" />
          </div>
          <h3 className="font-bold text-xl">Cross Platform</h3>
          <p className="text-foreground/60 leading-relaxed">Access your collection on Web, Desktop, or Mobile with seamless syncing.</p>
        </div>
      </section>
    </div>
  );
}

function RiLeafLine({ className }: { className?: string }) {
  return (
    <svg 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a8 8 0 0 1-8 8Z"></path>
      <path d="M7 21c-4.3-1.47-6-4.66-6-8a7 7 0 0 1 2.3-5.24"></path>
      <path d="M11 20c0-5.33 1.33-10.67 4-16"></path>
    </svg>
  );
}

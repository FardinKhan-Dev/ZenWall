"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RiArrowRightLine,
  RiSparklingLine,
  RiMagicLine,
  RiDownloadLine,
  RiLeafLine,
  RiLayoutMasonryLine,
  RiInstagramLine,
  RiTwitterXLine,
  RiGithubLine,
} from "react-icons/ri";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const EXAMPLES = [
  {
    title: "Morning Mist",
    prompt: "Zen garden in morning mist",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073",
  },
  {
    title: "Geometric Pine",
    prompt: "Minimalist pine forest, geometric",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2071",
  },
  {
    title: "Ethereal Peaks",
    prompt: "Ethereal mountain peaks, line art",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070",
  },
  {
    title: "Lunar Serenity",
    prompt: "A quiet mountain lake under a full moon, minimalist",
    url: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&q=80&w=2000",
  },
  {
    title: "Sakura Breeze",
    prompt: "Single cherry blossom branch against a soft gray sky",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=2000",
  },
  {
    title: "Arctic Silence",
    prompt: "Vast snow desert with a single small cabin, top view",
    url: "https://images.unsplash.com/photo-1478719059408-592965723cbc?auto=format&fit=crop&q=80&w=2000",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  // Scroll Logic for 3D UI Peek
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [25, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  // Auth redirect: Logged in users shouldn't see the landing page
  useEffect(() => {
    if (isHydrated && user) {
      router.push("/generate");
    }
  }, [isHydrated, user, router]);

  if (isHydrated && user) return null;

  return (
    <div className="flex flex-col w-full bg-background selection:bg-primary/20">
      {/* 🚀 HERO SECTION */}
      <section
        ref={containerRef}
        className="relative min-h-[120vh] flex flex-col items-center pt-20 px-6 overflow-visible"
      >
        {/* Animated Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10" />

        <div className="w-full max-w-5xl text-center space-y-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/80 backdrop-blur-xl border border-border/40 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-2xl"
          >
            <RiSparklingLine className="text-sm" /> The Future of Digital Atmosphere
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[1.05]"
          >
            Your Desk, <br /> Repainted by <span className="text-primary italic">ZenAI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The world&apos;s most peaceful AI wallpaper generator. Describe your vibe, and let us
            handle the pixels.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4"
          >
            <Link
              href="/credits"
              aria-label="Get started with ZenWall for free"
              className="group flex items-center gap-3 bg-primary text-white p-2 pl-8 pr-3 rounded-full text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 glow"
            >
              Get Started for Free
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                <RiArrowRightLine size={24} aria-hidden="true" />
              </div>
            </Link>
            <Link
              href="#gallery"
              className="text-foreground/60 hover:text-foreground font-bold text-lg transition-colors border-b-2 border-transparent hover:border-primary/50 py-2"
            >
              Explore Gallery
            </Link>
          </motion.div>
        </div>

        {/* 🖼️ 3D UI PEEK (Unique Bottom Hero Element) */}
        <div className="mt-20 w-[95%] max-w-6xl z-20 perspective-[2000px]">
          <motion.div
            style={{ rotateX, scale, y: translateY }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-background group"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none z-10" />

            <Image
              src="/Screenshot.webp"
              alt="ZenWall App Dashboard Preview"
              width={1400}
              height={800}
              priority
              className="w-full h-auto group-hover:scale-105 transition-transform duration-[2s] ease-out"
            />
          </motion.div>
        </div>

        {/* Floating Background Glow for the Peek */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/30 blur-[120px] rounded-full -z-10" />
      </section>

      {/* 📸 FEATURE SHOWCASE */}
      <section className="py-32 px-6 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Block 1: The AI Magic */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mb-8">
                <RiMagicLine />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Intuitive Prompts, <br /> Infinite Results.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                No complex toggles or confusing parameters. Simply describe what you want in plain
                English, and our curated ZenAI engine will interpret the artistic nuance perfectly.
              </p>
              <ul className="space-y-4 pt-4">
                {["Artistic Nuance Detection", "Vibe-based Generation", "Contextual Lighting"].map(
                  (item, i) => (
                    <li key={i} className="flex items-center gap-3 font-bold text-foreground/80">
                      <RiSparklingLine className="text-primary" /> {item}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-1 rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center group"
            >
              <div className="text-center group-hover:scale-110 transition-transform duration-700 w-full h-full">
                <Image
                  src="/Screenshot_2.webp"
                  alt="ZenWall Dashboard Interface showing minimal design"
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>

          {/* Block 2: Masterpiece Resolution */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mb-8">
                <RiDownloadLine />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Download in <br /> Cinematic Clarity.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                Your masterpieces were meant to be seen. Export atmospheric, noir-inspired art that
                looks crisp on every screen, from your 5K iMac to your mobile companion.
              </p>
              <Link
                href="/credits"
                className="inline-flex items-center gap-2 text-primary font-black hover:gap-4 transition-all pt-4"
              >
                See the Quality <RiArrowRightLine />
              </Link>
            </motion.div>
          </div>

          {/* Block 3: The Digital Vault (NEW) */}
          <div className="flex flex-col md:flex-row items-center gap-8 pt-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mb-8">
                <RiLayoutMasonryLine />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                Your Private <br /> <span className="text-primary italic">Digital Vault</span>.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                Never lose a masterpiece. Every generation is automatically synced to your private
                dashboard in high-definition quality. Organize, revisit, and download your
                collection from any device, anytime.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h4 className="font-black text-foreground">Cloud Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Access your history on Desktop, Tablet, or Mobile.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-foreground">Infinite Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    We save every detail of your creative journey.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-1 rounded-2xl bg-secondary border border-white/5 shadow-2xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-50" />
              <Image
                src="/ZenWall_Dashboard.webp"
                alt="ZenWall Private Dashboard Vault"
                width={1000}
                height={600}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  Vault Synchronized
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🏗️ HOW IT WORKS */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Three Steps to <span className="text-primary italic">Serenity</span>
            </h2>
            <p className="text-muted-foreground/60 font-medium text-lg">
              Sophisticated art has never been this simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Describe",
                desc: "Type in a vision. Use keywords like 'Minimalist', 'Misty', or 'Geometric'.",
              },
              {
                step: "02",
                title: "Craft",
                desc: "Our AI paints your masterpiece in seconds using cutting edge ZenAI logic.",
              },
              {
                step: "03",
                title: "Apply",
                desc: "Download instantly in high-res and transform your digital world with a single click.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-[3rem] bg-secondary/50 border border-border/20 space-y-6 hover:border-primary/40 transition-all shadow-sm"
              >
                <span className="text-5xl font-black text-primary/10 italic">{s.step}</span>
                <h3 className="text-2xl font-black">{s.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION - REMOVED AS REQUESTED */}

      {/* 🎨 EXPANDED GALLERY (With Prompt Teasers) */}
      <section id="gallery" className="py-32 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Hall of <span className="text-primary italic">Inspiration</span>
              </h2>
              <p className="text-muted-foreground/60 font-medium text-lg">
                See what the ZenWall community is creating.
              </p>
            </div>
            <Link
              href="/credits"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all"
            >
              View Collection
            </Link>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {EXAMPLES.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group relative rounded-[2.5rem] overflow-hidden border border-border/20 shadow-xl"
              >
                <Image
                  src={img.url}
                  alt={img.title}
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-black mb-2">{img.title}</h3>
                  <p className="text-sm text-white/60 italic mb-6 line-clamp-2">
                    &quot;{img.prompt}&quot;
                  </p>

                  {/* 💡 PROMPT TEASER BUTTON */}
                  <Link
                    href={`/generate?prompt=${encodeURIComponent(img.prompt)}`}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white py-4 rounded-3xl text-sm font-black shadow-2xl hover:bg-white hover:text-primary transition-all"
                  >
                    <RiMagicLine /> Try this Prompt
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏃 CTA SECTION */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 blur-[160px] rounded-full -z-10 animate-pulse" />
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            Ready to redesign your <span className="text-primary italic">vibe?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/credits"
              className="px-12 py-6 bg-primary text-white rounded-full text-xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started for Free
            </Link>
            <p className="text-muted-foreground font-medium italic">
              No credit card required. Pure art.
            </p>
          </div>
        </div>
      </section>

      {/* 🦶 FULL LANDING FOOTER */}
      <footer className="bg-secondary/50 pt-24 pb-12 px-6 border-t border-border/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-center md:text-left">
          <div className="space-y-6">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2">
              <RiLeafLine className="text-primary text-3xl" />
              <span className="font-extrabold text-2xl tracking-tighter">
                Zen<span className="text-primary italic">Wall</span>
              </span>
            </Link>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Empowering individuals to reclaim their digital focus through custom, AI-crafted
              serenity.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              {[
                { icon: RiInstagramLine, label: "Follow us on Instagram" },
                { icon: RiTwitterXLine, label: "Follow us on X (Twitter)" },
                { icon: RiGithubLine, label: "View source on GitHub" },
              ].map((item, i) => (
                <button
                  key={i}
                  aria-label={item.label}
                  className="w-10 h-10 rounded-full border border-border/40 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary transition-all"
                >
                  <item.icon size={20} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4">
              {[
                { name: "Generator", href: "/generate" },
                { name: "Collection", href: "/generate" },
                { name: "Showcase", href: "#gallery" },
                { name: "Credits", href: "/credits" },
              ].map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest">Resources</h4>
            <ul className="space-y-4">
              {["Art Style Guide", "Prompting Tips", "Community API", "Desktop App"].map((l, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-border/10 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground/40 font-medium text-sm italic">
            Crafted with peace by the ZenWall Team · &copy; {new Date().getFullYear()}
          </p>
          <RiSparklingLine className="text-primary/20 text-3xl" />
        </div>
      </footer>
    </div>
  );
}

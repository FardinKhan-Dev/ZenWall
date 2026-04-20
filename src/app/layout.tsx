import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Wallpaper Generator | Premium Nature Collection",
  description: "Generate high-resolution AI wallpapers with a Zen, minimalist aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <footer className="py-8 text-center text-sm text-foreground/60">
          © {new Date().getFullYear()} AI Wallpaper Gen. Built for high performance.
        </footer>
      </body>
    </html>
  );
}

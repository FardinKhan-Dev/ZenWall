import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ZenWall — AI Wallpaper Generator",
  description: "Generate stunning, high-resolution AI wallpapers with a serene, minimal aesthetic. Powered by Gemini Imagen.",
  keywords: ["AI wallpaper", "wallpaper generator", "Gemini Imagen", "nature wallpaper"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="py-8 text-center text-sm text-foreground/40 border-t border-border/20">
            © {new Date().getFullYear()} ZenWall · AI-Powered Wallpapers
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import ClientLayout from "@/components/ClientLayout";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ZenWall | Signature Atmospheric Noir Wallpapers",
  description:
    "Create premium, minimalist, and atmospheric noir wallpapers with AI. Isolated subjects, cinematic lighting, and professional photography aesthetics.",
  keywords: [
    "AI Wallpaper",
    "Zen Black",
    "Minimalist Wallpapers",
    "Atmospheric Noir",
    "Custom AI Art",
  ],
  authors: [{ name: "ZenWall Team" }],
  openGraph: {
    title: "ZenWall | AI-Powered Atmosphere",
    description: "Generate high-end atmospheric noir wallpapers for your devices.",
    url: "https://zenwall.app",
    siteName: "ZenWall",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} font-sans h-full selection:bg-primary/20 selection:text-primary`}
      >
        <AuthProvider>
          <ClientLayout>
            <Navbar />
            <main className="flex-grow">{children}</main>
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

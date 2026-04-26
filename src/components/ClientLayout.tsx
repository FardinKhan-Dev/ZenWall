"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/" || pathname === "/auth" || pathname === "/credits";

  return (
    <div className="flex items-start min-h-screen w-full">
      {!isPublicRoute && <Sidebar />}
      <div
        className={`flex-1 flex flex-col bg-background custom-scrollbar ${isPublicRoute ? "w-full" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

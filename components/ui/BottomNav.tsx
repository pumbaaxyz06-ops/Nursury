"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, DollarSign, ClipboardList } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { href: "/home", label: t("home"), icon: Home },
    { href: "/stock", label: t("stock"), icon: Package },
    { href: "/sales", label: t("sales"), icon: DollarSign },
    { href: "/bookings", label: t("bookings"), icon: ClipboardList },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-16 bg-white/80 backdrop-blur-lg border-t border-neutral-200/50 flex items-center justify-around px-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-all ${
              isActive 
                ? "text-[#306D29] font-bold scale-105" 
                : "text-neutral-600 font-medium hover:text-[#306D29]"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary-light text-[#306D29]" : "bg-transparent text-neutral-600"}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            </div>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

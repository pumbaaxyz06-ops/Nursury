"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, Building2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function UserHeaderMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Farmer User";
  const nurseryName = (session?.user as any)?.nursery_name || "Nursery Management";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/15 active:scale-95 transition-all text-white cursor-pointer"
        title="User Menu"
        aria-label="User Menu"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white shadow-premium-sm">
          {initials || <User size={16} />}
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-premium-lg border border-neutral-100 py-2 z-50 text-neutral-900 animate-fadeIn">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60 rounded-t-2xl">
            <div className="font-bold text-sm text-neutral-900 truncate">{userName}</div>
            <div className="text-xs text-neutral-500 truncate flex items-center gap-1 mt-0.5">
              <Building2 size={12} className="text-primary flex-shrink-0" />
              <span className="truncate">{nurseryName}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-neutral-700 hover:bg-emerald-50 hover:text-primary transition-colors cursor-pointer text-left"
            >
              <User size={16} className="text-primary" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-danger hover:bg-red-50 transition-colors cursor-pointer text-left"
            >
              <LogOut size={16} />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

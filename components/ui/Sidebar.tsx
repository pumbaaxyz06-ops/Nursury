"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, DollarSign, ClipboardList, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { href: "/home", label: t("home") || "Home", icon: Home },
    { href: "/stock", label: t("stock") || "Stock", icon: Package },
    { href: "/sales", label: t("sales") || "Sales", icon: DollarSign },
    { href: "/bookings", label: t("bookings") || "Bookings", icon: ClipboardList },
  ];

  const nurseryName = (session?.user as any)?.nursery_name || "Vriksh Nursery";

  return (
    <aside 
      className={`hidden md:flex flex-col bg-white border-r border-neutral-200 min-h-screen transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'}`}
      style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)" }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-100 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <span className="font-extrabold text-primary text-sm tracking-wider uppercase block">Vriksh</span>
              <span className="text-[10px] font-bold text-neutral-600 truncate max-w-[150px] block">{nurseryName}</span>
            </div>
          </div>
        )}
        {collapsed && (
          <span className="text-xl mx-auto">🌱</span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section / LogOut */}
      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`sidebar-link w-full text-left text-danger hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 bg-white border border-neutral-200 w-6 h-6 rounded-full flex items-center justify-center shadow-premium-sm text-neutral-600 hover:text-primary z-50 cursor-pointer hidden md:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}

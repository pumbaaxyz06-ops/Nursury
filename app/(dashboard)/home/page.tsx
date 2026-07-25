"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/ui/LangToggle";
import { useLang } from "@/lib/LanguageContext";
import UserHeaderMenu from "@/components/ui/UserHeaderMenu";
import {
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Truck,
  Sparkles,
} from "lucide-react";

interface HomeStats {
  totalStockQuantity: number;
  totalStockValue: number;
  categoriesCount: number;
  monthlySalesRevenue: number;
  totalSalesCount: number;
  pendingBookingsCount: number;
  totalBalanceDue: number;
  recentSales: any[];
  recentBookings: any[];
  lowStockCount: number;
  lowStockItems: any[];
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchStats();
  }, [status]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/home/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (status === "loading") {
    return <div className="p-8 text-center text-neutral-500 font-medium">Loading Dashboard...</div>;
  }

  const nurseryName = (session?.user as any)?.nursery_name || "Green Leaf Nursery";
  const userName = (session?.user as any)?.name || "Manager";

  return (
    <div className="flex-grow pb-8 text-left">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <div className="min-w-0">
          <div className="text-[11px] font-bold tracking-wider text-emerald-100 uppercase flex items-center gap-1">
            <Sparkles size={12} className="text-yellow-300" />
            NURSERY DASHBOARD
          </div>
          <h1 className="text-lg font-extrabold text-white mt-0.5 truncate">{nurseryName}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <LangToggle className="bg-white/10 border border-white/20 text-white" />
          <UserHeaderMenu />
        </div>
      </div>

      <div className="px-5 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome Greeting */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/30 p-4 rounded-2xl border border-emerald-100/80 shadow-premium-sm">
          <div>
            <span className="text-xs font-semibold text-emerald-800">Welcome back, {userName} 👋</span>
            <h2 className="text-base font-bold text-neutral-900 mt-0.5">Nursery Highlights & Performance</h2>
          </div>
          <button
            onClick={() => router.push("/sales")}
            className="btn-premium-primary !h-9 text-xs px-3 py-1 flex items-center gap-1 cursor-pointer"
          >
            + New Sale
          </button>
        </div>

        {/* Executive Key Metric Cards (2x2 Grid) */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-neutral-200 animate-pulse shadow-premium-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Total Stock Quantity */}
            <div
              onClick={() => router.push("/stock")}
              className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(48,109,41,0.25)] border-0 !p-4 cursor-pointer group active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  Total Plants
                </span>
                <Package size={18} className="text-emerald-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                {(stats?.totalStockQuantity || 0).toLocaleString()}
                <span className="text-xs font-medium text-emerald-100 ml-1">pcs</span>
              </div>
              <div className="text-[10px] text-emerald-100/90 mt-2 flex items-center gap-1 font-semibold">
                <span>{stats?.categoriesCount || 0} Categories</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Card 2: Stock Inventory Value */}
            <div
              onClick={() => router.push("/stock")}
              className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(30,77,25,0.2)] border-0 !p-4 cursor-pointer group active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  Stock Value
                </span>
                <TrendingUp size={18} className="text-emerald-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                ₹{(stats?.totalStockValue || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-100/90 mt-2 flex items-center gap-1 font-semibold">
                <span>Total Inventory Value</span>
              </div>
            </div>

            {/* Card 3: Monthly Revenue */}
            <div
              onClick={() => router.push("/sales")}
              className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(0,121,107,0.2)] border-0 !p-4 cursor-pointer group active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #006064, #0097A7)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  Monthly Revenue
                </span>
                <DollarSign size={18} className="text-cyan-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                ₹{(stats?.monthlySalesRevenue || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-cyan-100/90 mt-2 flex items-center gap-1 font-semibold">
                <span>{stats?.totalSalesCount || 0} Total Sales</span>
              </div>
            </div>

            {/* Card 4: Active Pending Orders */}
            <div
              onClick={() => router.push("/bookings")}
              className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(230,81,0,0.2)] border-0 !p-4 cursor-pointer group active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #E65100, #F57C00)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  Active Orders
                </span>
                <Clock size={18} className="text-orange-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                {stats?.pendingBookingsCount || 0}
                <span className="text-xs font-medium text-orange-100 ml-1">orders</span>
              </div>
              <div className="text-[10px] text-orange-100/90 mt-2 flex items-center gap-1 font-semibold">
                <span>₹{(stats?.totalBalanceDue || 0).toLocaleString()} Due</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Shortcuts */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider text-[11px] text-neutral-500">
            Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => router.push("/stock/add")}
              className="flex flex-col items-center justify-center p-3 bg-white border border-neutral-200/80 rounded-2xl shadow-premium-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#306D29] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <PlusCircle size={20} />
              </div>
              <span className="text-[11px] font-bold text-neutral-900">Add Stock</span>
            </button>

            <button
              onClick={() => router.push("/sales")}
              className="flex flex-col items-center justify-center p-3 bg-white border border-neutral-200/80 rounded-2xl shadow-premium-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#306D29] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ShoppingCart size={20} />
              </div>
              <span className="text-[11px] font-bold text-neutral-900">New Sale</span>
            </button>

            <button
              onClick={() => router.push("/bookings/new")}
              className="flex flex-col items-center justify-center p-3 bg-white border border-neutral-200/80 rounded-2xl shadow-premium-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <span className="text-[11px] font-bold text-neutral-900">New Booking</span>
            </button>

            <button
              onClick={() => router.push("/stock")}
              className="flex flex-col items-center justify-center p-3 bg-white border border-neutral-200/80 rounded-2xl shadow-premium-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
              <span className="text-[11px] font-bold text-neutral-900">Nursery Stock</span>
            </button>
          </div>
        </div>

        {/* Low Stock Warning Alert Banner (if any) */}
        {stats && stats.lowStockCount > 0 && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between shadow-premium-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">
                  ⚠️ {stats.lowStockCount} Plant{stats.lowStockCount > 1 ? "s" : ""} Low on Stock
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Restock plants under 20 pcs to avoid missing sales
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/stock")}
              className="px-3 py-1.5 bg-amber-800 text-white rounded-xl text-xs font-bold hover:bg-amber-900 transition-colors flex-shrink-0 cursor-pointer"
            >
              View Stock
            </button>
          </div>
        )}

        {/* Highlight 1: Recent Sales Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <FileText size={16} className="text-[#306D29]" />
              Recent Sales Activity
            </h3>
            <button
              onClick={() => router.push("/sales")}
              className="text-xs font-bold text-[#306D29] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {!stats || stats.recentSales.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 text-center text-xs text-neutral-500 shadow-premium-sm">
              No recent sales recorded yet. Click "+ New Sale" to create one.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recentSales.map((sale: any) => (
                <div
                  key={sale._id}
                  onClick={() => router.push("/sales")}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-premium-sm flex items-center justify-between hover:border-emerald-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#306D29] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      💵
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 truncate">
                        {sale.customer_name}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {sale.bill_number} · {sale.items?.length || 0} item(s) ·{" "}
                        <span className="uppercase font-semibold text-emerald-800">
                          {sale.payment_method}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-xs font-extrabold text-[#306D29]">
                      ₹{sale.final_amount}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      {new Date(sale.created_at).toLocaleDateString(lang === "gu" ? "gu-IN" : "en-US")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlight 2: Active Delivery Bookings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Truck size={16} className="text-[#306D29]" />
              Active Orders & Deliveries
            </h3>
            <button
              onClick={() => router.push("/bookings")}
              className="text-xs font-bold text-[#306D29] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {!stats || stats.recentBookings.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 text-center text-xs text-neutral-500 shadow-premium-sm">
              No active bookings. Click "New Booking" to schedule customer orders.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recentBookings.map((b: any) => (
                <div
                  key={b._id}
                  onClick={() => router.push(`/bookings/${b._id}`)}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-premium-sm flex items-center justify-between hover:border-emerald-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      📦
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 truncate">
                        {b.customer_name}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {b.booking_number} · Advance: ₹{b.advance_paid}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-xs font-bold text-danger">
                      Due: ₹{b.balance_due}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-0.5 ${
                        b.status === "fulfilled"
                          ? "bg-emerald-100 text-emerald-800"
                          : b.status === "ready_to_dispatch"
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t(b.status as any) || b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

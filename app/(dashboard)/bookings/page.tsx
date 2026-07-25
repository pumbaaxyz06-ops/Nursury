"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import LangToggle from "@/components/ui/LangToggle";

interface Booking {
  _id: string;
  booking_number: string;
  customer_name: string;
  subtotal: number;
  advance_paid: number;
  balance_due: number;
  status: string;
  expected_dispatch_date?: string;
}

export default function BookingsPage() {
  const { t } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"pending" | "ready_to_dispatch" | "fulfilled">("pending");
  const router = useRouter();

  async function load() {
    const res = await fetch(`/api/bookings?status=${tab}`);
    setBookings(await res.json());
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="flex-grow pb-24">
      {/* Premium #306D29 Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <h1 className="text-lg font-bold text-white">{t("bookings")}</h1>
        <LangToggle className="bg-white/10 border border-white/20 text-white" />
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Modern Segmented Tab Bar */}
        <div className="segmented-container max-w-md">
          <button 
            onClick={() => setTab("pending")} 
            className={`segmented-item ${tab === "pending" ? "active" : ""}`}
          >
            ⏳ {t("pending")}
          </button>
          <button 
            onClick={() => setTab("ready_to_dispatch")} 
            className={`segmented-item ${tab === "ready_to_dispatch" ? "active" : ""}`}
          >
            📦 {t("ready_to_dispatch")}
          </button>
          <button 
            onClick={() => setTab("fulfilled")} 
            className={`segmented-item ${tab === "fulfilled" ? "active" : ""}`}
          >
            ✅ {t("fulfilled")}
          </button>
        </div>

        {/* Bookings items */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
              <span className="text-4xl mb-3">📅</span>
              <h3 className="text-base font-bold text-neutral-900">No bookings in this state</h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-xs">There are currently no active orders matching this status tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <div 
                  key={b._id} 
                  onClick={() => router.push(`/bookings/${b._id}`)} 
                  className="premium-card flex flex-col justify-between items-stretch active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 text-base">{b.booking_number}</div>
                      <div className="text-sm font-semibold text-neutral-600 mt-0.5">{b.customer_name}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-premium-sm ${
                      b.status === "fulfilled" ? "bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]" : 
                      b.status === "ready_to_dispatch" ? "bg-[#E0F7FA] text-[#006064] border-[#B2EBF2]" : 
                      "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
                    }`}>
                      {t(b.status as any) || b.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">₹{b.advance_paid}</span> {t("advance_paid")} • <span className="font-bold text-danger">₹{b.balance_due}</span> {t("balance_due")}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${b._id}`); }} 
                      className="btn-premium-primary !h-8 text-xs py-1.5 px-3 bg-gradient-to-r from-primary to-secondary"
                    >
                      {t("dispatch")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => router.push("/bookings/new")} className="premium-fab">
        <Plus size={24} />
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Truck, Trash2, ChevronRight } from "lucide-react";
import LangToggle from "@/components/ui/LangToggle";
import UserHeaderMenu from "@/components/ui/UserHeaderMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

interface Booking {
  _id: string;
  booking_number: string;
  customer_name: string;
  subtotal: number;
  advance_paid: number;
  balance_due: number;
  status: string;
  expected_dispatch_date?: string;
  createdAt?: string;
}

function CustomStatusDropdown({
  currentStatus,
  onSelect,
}: {
  currentStatus: string;
  onSelect: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const labelMap: Record<string, string> = {
    pending: "⏳ Pending",
    ready_to_dispatch: "📦 Ready Dispatch",
    fulfilled: "✅ Fulfilled",
  };

  return (
    <div ref={ref} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-[10px] font-bold py-1 px-2.5 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-800 hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer shadow-premium-sm"
      >
        <span>{labelMap[currentStatus] || currentStatus}</span>
        <span className="text-[8px] text-neutral-500">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-40 w-36 bg-white rounded-xl border border-neutral-200 shadow-premium-md py-1 text-xs text-left overflow-hidden">
          {(["pending", "ready_to_dispatch", "fulfilled"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                onSelect(st);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 font-medium flex items-center gap-2 hover:bg-emerald-50 transition-colors cursor-pointer ${
                currentStatus === st ? "bg-emerald-50/80 font-bold text-[#306D29]" : "text-neutral-700"
              }`}
            >
              <span>{labelMap[st]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const { t, lang } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"pending" | "ready_to_dispatch" | "fulfilled">("pending");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    try {
      const res = await fetch(`/api/bookings?status=${tab}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    }
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function updateStatus(bookingId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Booking status updated to ${newStatus.replace(/_/g, " ")}`);
        load();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  }

  async function confirmDeleteBooking() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/bookings/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Booking deleted successfully");
        load();
      } else {
        toast.error("Delete failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
    setDeleteId(null);
  }

  return (
    <div className="flex-grow pb-6">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <h1 className="text-lg font-bold text-white">{t("bookings")}</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          <LangToggle className="bg-white/10 border border-white/20 text-white" />
          <UserHeaderMenu />
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-6 text-left">
        {/* Segmented Tab Bar */}
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
              {bookings.map((b) => {
                const bookedDate = b.createdAt
                  ? new Date(b.createdAt).toLocaleDateString(lang === "gu" ? "gu-IN" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "";

                const dispatchDate = b.expected_dispatch_date
                  ? new Date(b.expected_dispatch_date).toLocaleDateString(lang === "gu" ? "gu-IN" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div 
                    key={b._id} 
                    onClick={() => router.push(`/bookings/${b._id}`)} 
                    className="premium-card flex flex-col justify-between items-stretch active:scale-[0.99] cursor-pointer relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-neutral-900 text-base">{b.booking_number}</div>
                        <div className="text-sm font-semibold text-neutral-700 mt-0.5 truncate">{b.customer_name}</div>
                        {bookedDate && (
                          <div className="flex flex-col gap-0.5 text-[11px] font-medium text-neutral-600 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#306D29] flex-shrink-0" />
                              <span>Booked: <strong className="text-neutral-900 font-bold">{bookedDate}</strong></span>
                            </div>
                            {dispatchDate && (
                              <div className="flex items-center gap-1.5 text-emerald-800">
                                <Truck size={12} className="text-[#306D29] flex-shrink-0" />
                                <span>Dispatch: <strong className="text-emerald-900 font-bold">{dispatchDate}</strong></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-premium-sm ${
                            b.status === "fulfilled" ? "bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]" : 
                            b.status === "ready_to_dispatch" ? "bg-[#E0F7FA] text-[#006064] border-[#B2EBF2]" : 
                            "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]"
                          }`}>
                            {t(b.status as any) || b.status}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(b._id);
                            }}
                            className="w-7 h-7 rounded-full bg-white border border-neutral-200 text-danger flex items-center justify-center shadow-premium-sm hover:bg-red-50 cursor-pointer"
                            title="Delete Booking"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Custom Frame-Constrained React Status Selector Dropdown */}
                        <CustomStatusDropdown
                          currentStatus={b.status}
                          onSelect={(newSt) => updateStatus(b._id, newSt)}
                        />
                      </div>
                    </div>

                    {/* Footer Payment & Action */}
                    <div className="text-xs text-neutral-600 mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <div>
                          <span className="font-bold text-neutral-900">₹{b.advance_paid}</span> {t("advance_paid")}
                        </div>
                        <div>
                          <span className="font-bold text-danger">₹{b.balance_due}</span> {t("balance_due")}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/bookings/${b._id}`); }} 
                        className="btn-premium-primary !h-9 text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0 cursor-pointer"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => router.push("/bookings/new")} className="premium-fab cursor-pointer">
        <Plus size={24} />
      </button>

      {/* Confirm Delete Booking Modal */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Booking Order"
        message="Are you sure you want to delete this booking order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDeleteBooking}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/LanguageContext";
import DispatchModal from "@/components/bookings/DispatchModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { toast } from "sonner";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [showDispatch, setShowDispatch] = useState(false);
  const { t } = useLang();

  async function load() {
    const res = await fetch(`/api/bookings/${id}`);
    setBooking(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!booking) return <div className="p-5">Loading...</div>;

  const markReady = async () => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "ready_to_dispatch" }),
      headers: { "Content-Type": "application/json" },
    });
    toast.success("Marked ready");
    load();
  };

  return (
    <div className="pb-20">
      <PageHeader title={booking.booking_number} showBack />

      <div className="p-5 space-y-5">
        <div className="premium-card">
          <div className="font-bold text-lg text-neutral-900">{booking.customer_name}</div>
          <div className="text-sm text-neutral-600">{booking.customer_phone}</div>
          {booking.customer_address && <div className="mt-1 text-sm text-neutral-900">{booking.customer_address}</div>}
          <div className="mt-4"><StatusBadge status={booking.status} /></div>
        </div>

        <div className="premium-card">
          <div className="font-bold mb-3 text-neutral-900">Items</div>
          {booking.items.map((it: any, i: number) => (
            <div key={i} className="flex justify-between py-2 text-sm border-b border-neutral-100 last:border-0 text-neutral-900">
              <div>{it.name} × {it.quantity}</div>
              <div className="font-semibold">₹{it.total}</div>
            </div>
          ))}
          <div className="pt-3 flex justify-between font-bold text-neutral-900 border-t border-neutral-200 mt-2">
            <div>Total</div>
            <div>₹{booking.subtotal}</div>
          </div>
          <div className="text-xs text-neutral-600 mt-2 pt-2 border-t border-neutral-100 flex justify-between">
            <span>Paid: <b className="text-neutral-900">₹{booking.advance_paid}</b></span>
            <span>Due: <b className="text-danger">₹{booking.balance_due}</b></span>
          </div>
        </div>

        {booking.status === "pending" && (
          <button onClick={markReady} className="btn-premium-primary w-full">🚚 Mark Ready to Dispatch</button>
        )}

        {booking.status === "ready_to_dispatch" && (
          <button onClick={() => setShowDispatch(true)} className="btn-premium-primary w-full">✅ Mark Fulfilled + Add Driver</button>
        )}

        {booking.driver_name && (
          <div className="premium-card text-sm">
            Driver: <span className="font-bold text-neutral-900">{booking.driver_name}</span> ({booking.driver_phone})
          </div>
        )}
      </div>

      <DispatchModal
        open={showDispatch}
        bookingId={id}
        onClose={() => setShowDispatch(false)}
        onDone={() => {
          toast.success(t("dispatch_confirmed"));
          load();
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

interface Props {
  open: boolean;
  bookingId: string;
  onClose: () => void;
  onDone: () => void;
}

export default function DispatchModal({ open, bookingId, onClose, onDone }: Props) {
  const { t } = useLang();
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function confirmDispatch() {
    if (!driverName || !driverPhone) return alert("Driver details required");
    setLoading(true);

    await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "fulfilled",
        driver_name: driverName,
        driver_phone: driverPhone,
        notes: note,
      }),
    });

    setLoading(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-[200]">
      <div className="bg-white w-full max-w-[420px] mx-auto rounded-t-3xl p-5 pb-8">
        <div className="text-xl font-extrabold mb-1">🚚 Driver Details</div>
        <div className="text-sm text-muted mb-4">This will mark the booking as fulfilled and deduct stock</div>

        <div className="space-y-3 mb-5">
          <div>
            <div className="text-xs font-bold text-muted mb-1">DRIVER NAME *</div>
            <input className="input" placeholder="Driver full name" value={driverName} onChange={e => setDriverName(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-bold text-muted mb-1">DRIVER PHONE *</div>
            <input className="input" placeholder="10 digit number" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-bold text-muted mb-1">NOTE (OPTIONAL)</div>
            <textarea className="input h-20" placeholder="Any special instructions..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div className="text-xs text-orange-700 bg-orange-50 p-3 rounded-xl mb-5">
          ⚠️ Stock will be deducted from inventory. Customer will be notified.
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button onClick={confirmDispatch} disabled={loading || !driverName || !driverPhone} className="flex-1 btn-primary">Confirm &amp; Dispatch</button>
        </div>
      </div>
    </div>
  );
}

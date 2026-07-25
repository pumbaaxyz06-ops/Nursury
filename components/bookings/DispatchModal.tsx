"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/LanguageContext";
import { Truck, X, AlertTriangle, User, Phone, Car, FileText } from "lucide-react";

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
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  async function confirmDispatch() {
    if (!driverName || !driverPhone) return alert("Driver details required");
    setLoading(true);

    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "fulfilled",
          driver_name: driverName,
          driver_phone: driverPhone,
          vehicle_number: vehicleNumber,
          notes: note,
        }),
      });

      onDone();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const targetContainer = typeof document !== "undefined" ? (document.getElementById("app-frame") || document.body) : null;
  if (!targetContainer) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Scrollable Bootstrap-style Modal Dialog */}
      <div className="bg-white w-[calc(100%-1.5rem)] max-w-[420px] rounded-3xl shadow-2xl border border-emerald-100/80 relative overflow-hidden flex flex-col max-h-[85vh] my-auto">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#306D29] to-[#4CAF50] z-10" />

        {/* Modal Header (Fixed) */}
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-neutral-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">Driver Details</h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">Assign driver details before dispatching stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 space-y-4 text-left">
          {/* Driver Name */}
          <div>
            <div className="flex items-center gap-1.5 text-[#306D29] text-xs font-semibold mb-1.5">
              <User size={15} className="text-[#306D29]" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-neutral-600">DRIVER FULL NAME *</span>
            </div>
            <input
              className="premium-input !h-12 text-sm font-medium"
              placeholder="e.g. Ramesh Bhai"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          {/* Driver Phone */}
          <div>
            <div className="flex items-center gap-1.5 text-[#306D29] text-xs font-semibold mb-1.5">
              <Phone size={15} className="text-[#306D29]" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-neutral-600">DRIVER PHONE NUMBER *</span>
            </div>
            <input
              className="premium-input !h-12 text-sm font-medium"
              placeholder="10 digit mobile number"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <div className="flex items-center gap-1.5 text-[#306D29] text-xs font-semibold mb-1.5">
              <Car size={15} className="text-[#306D29]" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-neutral-600">VEHICLE NUMBER (optional)</span>
            </div>
            <input
              className="premium-input !h-12 text-sm font-medium uppercase"
              placeholder="E.G. GJ-01-AB-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </div>

          {/* Dispatch Note */}
          <div>
            <div className="flex items-center gap-1.5 text-[#306D29] text-xs font-semibold mb-1.5">
              <FileText size={15} className="text-[#306D29]" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-neutral-600">DISPATCH NOTE (optional)</span>
            </div>
            <textarea
              className="premium-input !h-20 py-2.5 text-sm resize-none"
              placeholder="Special loading or vehicle instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Warning Callout Box */}
          <div className="flex items-start gap-2.5 p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl text-xs text-[#92400E]">
            <AlertTriangle size={18} className="text-[#D97706] flex-shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">Stock will be deducted from inventory upon dispatch confirmation.</span>
          </div>
        </div>

        {/* Modal Footer (Fixed Sticky at Bottom) */}
        <div className="p-4 sm:px-6 bg-white border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 btn-premium-secondary !h-11 text-sm font-semibold cursor-pointer">
            Cancel
          </button>
          <button
            onClick={confirmDispatch}
            disabled={loading || !driverName || !driverPhone}
            className="flex-1 btn-premium-primary !h-11 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Dispatching..." : "Confirm & Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, targetContainer);
}

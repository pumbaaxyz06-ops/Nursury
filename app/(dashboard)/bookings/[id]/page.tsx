"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import BookingForm from "@/components/bookings/BookingForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLang } from "@/lib/LanguageContext";
import DispatchModal from "@/components/bookings/DispatchModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Truck,
  Phone,
  Car,
  MapPin,
  User,
  FileText,
  CheckCircle,
  Pencil,
  Trash2,
  Clock,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [showDispatch, setShowDispatch] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { t } = useLang();

  async function load() {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      setBooking(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!booking) return <div className="p-8 text-center text-neutral-500 font-medium">Loading booking details...</div>;

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Booking status changed to ${newStatus.replace(/_/g, " ")}`);
        load();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Booking deleted successfully");
        router.push("/bookings");
      } else {
        toast.error("Delete failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
    setDeleteConfirm(false);
  };

  const copyDriverDetails = () => {
    const lines = [
      `🚚 *DRIVER STOCK LOADING DETAILS*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *Booking No:* ${booking.booking_number}`,
      `👤 *Customer Name:* ${booking.customer_name}`,
      `📞 *Customer Phone:* ${booking.customer_phone}`,
      booking.customer_address ? `📍 *Delivery Address:* ${booking.customer_address}` : "",
      `🚚 *Driver Name:* ${booking.driver_name || "N/A"}`,
      `📱 *Driver Phone:* ${booking.driver_phone || "N/A"}`,
      booking.vehicle_number ? `🚘 *Vehicle No:* ${booking.vehicle_number}` : "",
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📦 *LOADED STOCK ITEMS:*`,
      ...booking.items.map(
        (it: any, idx: number) => `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit} (₹${it.total})`
      ),
      `━━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Subtotal:* ₹${booking.subtotal}`,
      `✅ *Advance Paid:* ₹${booking.advance_paid}`,
      `⚠️ *Balance Due:* ₹${booking.balance_due}`,
      booking.notes ? `📝 *Notes:* ${booking.notes}` : "",
    ].filter(Boolean);

    const text = lines.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Driver stock details copied to clipboard!");
  };

  const downloadDriverSlipPDF = async () => {
    try {
      let relatedBookings = [booking];
      if (booking.driver_name || booking.vehicle_number || booking.driver_phone) {
        try {
          const res = await fetch("/api/bookings?status=fulfilled");
          if (res.ok) {
            const allFulfilled = await res.json();
            if (Array.isArray(allFulfilled)) {
              const matched = allFulfilled.filter(
                (b: any) =>
                  b._id !== booking._id &&
                  ((booking.vehicle_number && b.vehicle_number === booking.vehicle_number) ||
                    (booking.driver_phone && b.driver_phone === booking.driver_phone) ||
                    (booking.driver_name && b.driver_name === booking.driver_name))
              );
              relatedBookings = [booking, ...matched];
            }
          }
        } catch (e) {
          console.error("Could not fetch related bookings", e);
        }
      }

      const doc = new jsPDF();
      const totalParties = relatedBookings.length;

      // Header Banner
      doc.setFillColor(48, 109, 41);
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(
        totalParties > 1
          ? "DRIVER MULTI-PARTY VEHICLE DELIVERY MANIFEST"
          : "DRIVER STOCK DELIVERY SLIP",
        14,
        20
      );

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Vehicle No: ${booking.vehicle_number || "N/A"}  |  Driver: ${booking.driver_name || "N/A"} (${booking.driver_phone || "N/A"})`,
        14,
        28
      );
      doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 160, 28);

      let currentY = 44;
      let grandTotalAmount = 0;
      let grandTotalBalance = 0;

      // Render Party Section & Table
      relatedBookings.forEach((b: any, index: number) => {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(240, 247, 240);
        doc.roundedRect(14, currentY, 182, 28, 3, 3, "F");
        doc.setDrawColor(48, 109, 41);
        doc.roundedRect(14, currentY, 182, 28, 3, 3, "D");

        doc.setTextColor(48, 109, 41);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(
          `PARTY #${index + 1}: ${b.customer_name.toUpperCase()} (Booking: ${b.booking_number})`,
          18,
          currentY + 8
        );

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Phone: ${b.customer_phone}`, 18, currentY + 16);
        doc.text(`Delivery Address: ${b.customer_address || "N/A"}`, 18, currentY + 22);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text(`Balance Due: Rs. ${b.balance_due}`, 140, currentY + 16);

        currentY += 32;

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Stock Item Name", "Quantity", "Unit", "Price (Rs)", "Total (Rs)"]],
          body: b.items.map((it: any, i: number) => [
            i + 1,
            it.name,
            it.quantity,
            it.unit,
            `Rs. ${it.price_per_unit}`,
            `Rs. ${it.total}`,
          ]),
          headStyles: { fillColor: [48, 109, 41], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 250, 248] },
          theme: "striped",
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
        grandTotalAmount += b.subtotal;
        grandTotalBalance += b.balance_due;
      });

      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(245, 248, 245);
      doc.roundedRect(14, currentY, 182, 26, 3, 3, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`VEHICLE TOTAL SUMMARY (${totalParties} Party / Customer Deliveries)`, 20, currentY + 9);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Load Value: Rs. ${grandTotalAmount}`, 20, currentY + 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text(`Total Vehicle Balance Collectible: Rs. ${grandTotalBalance}`, 110, currentY + 18);

      currentY += 36;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Driver Signature: _______________________", 14, currentY);
      doc.text("Vehicle Receiver Signature: _______________________", 110, currentY);

      const filename =
        totalParties > 1
          ? `Vehicle_Manifest_${booking.vehicle_number || booking.booking_number}.pdf`
          : `Driver_Slip_${booking.booking_number}.pdf`;

      doc.save(filename);
      toast.success(
        totalParties > 1
          ? `Multi-party manifest exported for ${totalParties} parties!`
          : "Driver Slip PDF downloaded!"
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="pb-6">
      <PageHeader
        title={editing ? `Edit ${booking.booking_number}` : booking.booking_number}
        showBack
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold hover:bg-white/25 transition-colors cursor-pointer"
            >
              <Pencil size={14} />
              {editing ? "Cancel Edit" : "Edit"}
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="p-1.5 rounded-xl bg-red-500/20 border border-red-200/30 text-white hover:bg-red-500/40 transition-colors cursor-pointer"
              title="Delete Booking"
            >
              <Trash2 size={16} />
            </button>
          </div>
        }
      />

      <div className="p-5 max-w-3xl mx-auto w-full space-y-6">
        {editing ? (
          <BookingForm
            initialData={booking}
            onSaved={() => {
              setEditing(false);
              load();
            }}
          />
        ) : (
          <>
            {/* Customer Info Card */}
            <div className="premium-card relative overflow-hidden space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-extrabold text-neutral-900">{booking.customer_name}</div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                    <Phone size={15} className="text-primary" />
                    <span>{booking.customer_phone}</span>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              {booking.customer_address && (
                <div className="flex items-start gap-2 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 mt-2">
                  <MapPin size={15} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>{booking.customer_address}</span>
                </div>
              )}
            </div>

            {/* Standalone Status Change Actions */}
            <div className="premium-card space-y-3 border border-neutral-200/90 bg-neutral-50/50">
              <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Booking Status Actions & Transitions
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Button 1: Ready to Dispatch */}
                {booking.status !== "ready_to_dispatch" && (
                  <button
                    onClick={() => updateStatus("ready_to_dispatch")}
                    className="btn-premium-secondary !h-10 text-xs gap-1.5 flex items-center justify-center cursor-pointer"
                  >
                    <Truck size={16} className="text-[#306D29]" />
                    <span>Mark Ready to Dispatch</span>
                  </button>
                )}

                {/* Button 2: Assign Driver Details */}
                <button
                  onClick={() => setShowDispatch(true)}
                  className="btn-premium-primary !h-10 text-xs gap-1.5 flex items-center justify-center cursor-pointer"
                >
                  <Car size={16} />
                  <span>Assign Driver & Vehicle Details</span>
                </button>

                {/* Button 3: Revert to Pending */}
                {booking.status !== "pending" && (
                  <button
                    onClick={() => updateStatus("pending")}
                    className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock size={15} />
                    <span>Revert to Pending</span>
                  </button>
                )}

                {/* Button 4: Mark Fulfilled */}
                {booking.status !== "fulfilled" && (
                  <button
                    onClick={() => updateStatus("fulfilled")}
                    className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Mark Order Fulfilled</span>
                  </button>
                )}
              </div>
            </div>

            {/* Driver Details Card (If assigned) */}
            {booking.driver_name && (
              <div className="premium-card space-y-4 border-2 border-emerald-500/30 bg-emerald-50/30">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                    <Truck size={20} className="text-primary" />
                    <span>Driver & Loading Vehicle Info</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={12} /> Assigned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <User size={12} /> Driver Name
                    </div>
                    <div className="font-bold text-neutral-900 mt-0.5">{booking.driver_name}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Phone size={12} /> Driver Phone
                    </div>
                    <div className="font-bold text-neutral-900 mt-0.5">{booking.driver_phone}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Car size={12} /> Vehicle Number
                    </div>
                    <div className="font-bold text-neutral-900 mt-0.5">{booking.vehicle_number || "Not specified"}</div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="text-xs text-neutral-700 bg-white p-3 rounded-xl border border-neutral-200/80 flex items-start gap-2">
                    <FileText size={15} className="text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900">Driver Notes: </span>
                      {booking.notes}
                    </div>
                  </div>
                )}

                {/* Copy & Download PDF Actions for Driver */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={copyDriverDetails}
                    className="flex-1 btn-premium-secondary !h-11 text-xs gap-2 cursor-pointer shadow-premium-sm"
                  >
                    <Copy size={16} className="text-primary" /> Copy Stock Summary
                  </button>
                  <button
                    onClick={downloadDriverSlipPDF}
                    className="flex-1 btn-premium-primary !h-11 text-xs gap-2 cursor-pointer shadow-premium-sm"
                  >
                    <Download size={16} /> Download Driver Manifest (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* Stock Items Card */}
            <div className="premium-card space-y-4">
              <div className="font-bold text-base text-neutral-900">Loaded Stock Items</div>
              <div className="divide-y divide-neutral-100">
                {booking.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-3 text-sm">
                    <div>
                      <div className="font-bold text-neutral-900">{it.name}</div>
                      <div className="text-xs text-neutral-500">
                        {it.quantity} {it.unit} × ₹{it.price_per_unit}
                      </div>
                    </div>
                    <div className="font-bold text-neutral-900 text-base">₹{it.total}</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-200 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Subtotal</span>
                  <span>₹{booking.subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Advance Paid</span>
                  <span className="font-bold text-emerald-700">₹{booking.advance_paid}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-danger border-t border-dashed border-neutral-200 pt-2">
                  <span>Balance Due</span>
                  <span>₹{booking.balance_due}</span>
                </div>
              </div>
            </div>
          </>
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

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Booking Order"
        message="Are you sure you want to delete this booking order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}

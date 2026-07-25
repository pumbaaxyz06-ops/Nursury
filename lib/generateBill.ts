import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface BillNurseryInfo {
  nurseryName: string;
  ownerName?: string;
  phone?: string;
  address?: string;
}

export function generateBill(sale: any, nursery: string | BillNurseryInfo) {
  const info: BillNurseryInfo =
    typeof nursery === "string"
      ? { nurseryName: nursery }
      : nursery;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const right = pageW - margin;

  // Header band
  doc.setFillColor(48, 109, 41);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setFillColor(76, 175, 80);
  doc.rect(0, 36, pageW, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(info.nurseryName || "Nursery", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const headerLines: string[] = [];
  if (info.ownerName) headerLines.push(`Prop. / Owner: ${info.ownerName}`);
  if (info.phone) headerLines.push(`Phone: ${info.phone}`);
  if (info.address) headerLines.push(info.address);
  headerLines.push("Nursery Stock & Sales Bill");
  doc.text(headerLines, margin, 23);

  // TAX INVOICE label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(sale.with_gst ? "TAX INVOICE" : "SALES BILL", right, 16, { align: "right" });

  // Bill meta box
  doc.setTextColor(31, 41, 55);
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(248, 255, 248);
  doc.roundedRect(margin, 46, pageW - margin * 2, 28, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Bill No:", margin + 4, 54);
  doc.setFont("helvetica", "normal");
  doc.text(String(sale.bill_number || "-"), margin + 28, 54);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin + 4, 61);
  doc.setFont("helvetica", "normal");
  doc.text(
    new Date(sale.created_at || Date.now()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    margin + 28,
    61
  );

  doc.setFont("helvetica", "bold");
  doc.text("Payment:", margin + 4, 68);
  doc.setFont("helvetica", "normal");
  doc.text(String(sale.payment_method || "cash").toUpperCase(), margin + 28, 68);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", pageW / 2 + 4, 54);
  doc.setFont("helvetica", "normal");
  doc.text(sale.customer_name || "Walk-in Customer", pageW / 2 + 28, 54);
  if (sale.customer_phone) {
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", pageW / 2 + 4, 61);
    doc.setFont("helvetica", "normal");
    doc.text(String(sale.customer_phone), pageW / 2 + 28, 61);
  }

  const body = (sale.items || []).map((item: any, idx: number) => [
    String(idx + 1),
    item.name,
    `${item.quantity} ${item.unit || ""}`.trim(),
    `Rs. ${Number(item.price_per_unit).toFixed(2)}`,
    `Rs. ${Number(item.total).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["#", "Item / Variety", "Qty", "Rate", "Amount"]],
    body,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [48, 109, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 34, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  let y = finalY + 8;

  const subtotal = Number(sale.subtotal || 0);
  const discount = Number(sale.discount || 0);
  const gstAmount = Number(sale.gst_amount || 0);
  const gstPercent = Number(sale.gst_percent || 0);
  const total = Number(sale.final_amount || 0);

  const boxX = pageW / 2;
  const boxW = pageW / 2 - margin;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(boxX, y - 4, boxW, sale.with_gst ? 36 : 28, 2, 2, "FD");

  const row = (label: string, value: string, bold = false, color?: [number, number, number]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(color || [31, 41, 55]));
    doc.text(label, boxX + 4, y);
    doc.text(value, right - 2, y, { align: "right" });
    y += 7;
  };

  row("Subtotal", `Rs. ${subtotal.toFixed(2)}`);
  row("Discount", `Rs. ${discount.toFixed(2)}`);
  if (sale.with_gst) {
    row(`GST (${gstPercent}%)`, `Rs. ${gstAmount.toFixed(2)}`);
  }
  doc.setDrawColor(48, 109, 41);
  doc.setLineWidth(0.4);
  doc.line(boxX + 4, y - 3, right - 2, y - 3);
  row("Grand Total", `Rs. ${total.toFixed(2)}`, true, [48, 109, 41]);

  // Amount in words hint
  y += 6;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Amount Payable: Rs. ${total.toFixed(2)}${sale.with_gst ? " (Inclusive of GST)" : ""}`,
    margin,
    y
  );

  // Signature / stamp section
  const sigY = Math.max(y + 28, 240);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  // Customer
  doc.line(margin, sigY, margin + 60, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Customer Signature", margin, sigY + 5);

  // Stamp box
  const stampX = pageW / 2 - 22;
  doc.setDrawColor(48, 109, 41);
  doc.setLineDashPattern([1, 1], 0);
  doc.roundedRect(stampX, sigY - 22, 44, 28, 2, 2, "S");
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(48, 109, 41);
  doc.text("COMPANY SEAL", stampX + 22, sigY - 8, { align: "center" });
  doc.text("/ STAMP", stampX + 22, sigY - 3, { align: "center" });

  // Authorized signatory
  doc.setDrawColor(200, 200, 200);
  doc.line(right - 60, sigY, right, sigY);
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.text("Authorised Signatory", right, sigY + 5, { align: "right" });
  if (info.ownerName) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(info.ownerName, right, sigY + 10, { align: "right" });
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`For ${info.nurseryName || "Nursery"}`, right, sigY + 15, { align: "right" });

  // Footer
  doc.setFillColor(48, 109, 41);
  doc.rect(0, 285, pageW, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(
    `Generated by Vriksh Nursery Platform  •  ${new Date().getFullYear()}  •  Thank you for your business!`,
    pageW / 2,
    292,
    { align: "center" }
  );

  doc.save(`${sale.bill_number || "bill"}.pdf`);
}

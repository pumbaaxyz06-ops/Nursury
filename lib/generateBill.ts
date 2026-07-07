import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateBill(sale: any, nurseryName: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(nurseryName, 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Bill No: ${sale.bill_number}`, 14, 30);
  doc.text(`Date: ${new Date(sale.created_at || Date.now()).toLocaleDateString("en-IN")}`, 14, 36);
  doc.text(`Customer: ${sale.customer_name}`, 14, 42);
  if (sale.customer_phone) doc.text(`Phone: ${sale.customer_phone}`, 14, 48);

  autoTable(doc, {
    startY: 56,
    head: [["Item", "Qty", "Rate", "Total"]],
    body: sale.items.map((item: any) => [
      item.name,
      `${item.quantity} ${item.unit}`,
      `₹${item.price_per_unit}`,
      `₹${item.total}`,
    ]),
    foot: [
      ["", "", "Subtotal", `₹${sale.subtotal}`],
      ["", "", "Discount", `₹${sale.discount}`],
      ["", "", "Total", `₹${sale.final_amount}`],
    ],
  });

  doc.save(`${sale.bill_number}.pdf`);
}

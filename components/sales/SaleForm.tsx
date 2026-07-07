"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface StockOption {
  _id: string;
  name: { en: string; gu: string };
  quantity: number;
  unit: string;
  price_per_unit: number;
}

export default function SaleForm({ onComplete }: { onComplete: (sale: any) => void }) {
  const { t, lang } = useLang();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<"cash" | "upi" | "credit">("cash");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    const res = await fetch("/api/stock");
    setStockOptions(await res.json());
  }

  const filteredStock = stockOptions.filter((s) =>
    (lang === "gu" ? s.name.gu : s.name.en).toLowerCase().includes(searchTerm.toLowerCase())
  );

  function addItem(stock: StockOption) {
    if (items.find((i) => i.stock_item_id === stock._id)) return;
    setItems([
      ...items,
      {
        stock_item_id: stock._id,
        name: lang === "gu" ? stock.name.gu : stock.name.en,
        quantity: 1,
        unit: stock.unit,
        price_per_unit: stock.price_per_unit,
        total: stock.price_per_unit,
      },
    ]);
  }

  function updateQty(index: number, qty: number) {
    const updated = [...items];
    updated[index].quantity = Math.max(1, qty);
    updated[index].total = updated[index].quantity * updated[index].price_per_unit;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const final = Math.max(0, subtotal - discount);

  async function handleSubmit() {
    if (!customerName || items.length === 0) {
      toast.error("Customer name and at least one item required");
      return;
    }
    setLoading(true);

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      items,
      subtotal,
      discount,
      final_amount: final,
      payment_method: payment,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const savedSale = await res.json();
      toast.success(t("sale_success"));
      onComplete(savedSale);
    } else {
      toast.error("Failed to save sale");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
      
      {/* Customer quick fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">Customer Name *</label>
          <input 
            className="premium-input" 
            placeholder="e.g. Valji Bhai" 
            value={customerName} 
            onChange={e=>setCustomerName(e.target.value)} 
          />
        </div>
        <div>
          <label className="premium-label">Phone Number (optional)</label>
          <input 
            className="premium-input" 
            placeholder="e.g. 9876543210" 
            value={customerPhone} 
            onChange={e=>setCustomerPhone(e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="premium-label mb-0 block">Select Items from Stock</label>
        <div className="relative">
          <input 
            className="premium-input !pl-11" 
            placeholder="Search stock catalog..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">🔍</span>
        </div>
        {searchTerm && filteredStock.length > 0 && (
          <div className="border border-neutral-200 bg-white rounded-xl max-h-36 overflow-y-auto shadow-premium-sm text-sm divide-y divide-neutral-100 z-10 relative">
            {filteredStock.slice(0, 5).map(s => (
              <div 
                key={s._id} 
                onClick={() => { addItem(s); setSearchTerm(""); }} 
                className="px-4 py-2 hover:bg-neutral-50 flex items-center justify-between cursor-pointer"
              >
                <span>{lang==="gu" ? s.name.gu : s.name.en}</span>
                <span className="font-bold text-primary">₹{s.price_per_unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          <label className="premium-label">Selected Items</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-center bg-neutral-50 border border-neutral-200/60 p-3.5 rounded-xl text-sm justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-neutral-900 truncate">{item.name}</div>
                <div className="text-[10px] text-neutral-600 mt-0.5">Price: ₹{item.price_per_unit}/{item.unit}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
                  <button 
                    type="button"
                    onClick={() => updateQty(index, item.quantity - 1)} 
                    className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-50 text-base font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 font-semibold text-neutral-900">{item.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => updateQty(index, item.quantity + 1)} 
                    className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-50 text-base font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="font-bold text-neutral-900 w-16 text-right">₹{item.total}</div>
                <button 
                  type="button"
                  onClick={() => removeItem(index)} 
                  className="text-danger hover:text-red-700 ml-1 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-primary-light/40 border border-primary/20 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between font-medium">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-bold text-neutral-900">₹{subtotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Discount Discount (₹)</span>
            <input 
              type="number" 
              className="premium-input !h-9 !w-24 text-right" 
              value={discount} 
              onChange={e => setDiscount(+e.target.value)} 
            />
          </div>
          <div className="flex justify-between font-bold border-t border-primary/20 pt-2 text-primary">
            <span>Total Final Amount</span>
            <span>₹{final}</span>
          </div>
        </div>
      )}

      <div>
        <label className="premium-label">Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          {(["cash", "upi", "credit"] as const).map((p) => {
            const isSelected = payment === p;
            return (
              <button 
                key={p} 
                type="button"
                onClick={() => setPayment(p)} 
                className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  isSelected 
                    ? "text-white border-transparent shadow-premium-sm" 
                    : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
                }`}
                style={isSelected ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" } : undefined}
              >
                {t(p) || p}
              </button>
            );
          })}
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading || !customerName || items.length === 0} 
        className="btn-premium-primary w-full"
      >
        {loading ? "Saving sale..." : "📄 Complete Sale & Bill"}
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";

export default function BookingForm({ onSaved }: { onSaved: () => void }) {
  const { t, lang } = useLang();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [advance, setAdvance] = useState(0);
  const [expected, setExpected] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/stock")
      .then(r => r.ok ? r.json() : [])
      .then(setStock)
      .catch(() => setStock([]));
  }, []);

  const filtered = stock.filter((s: any) =>
    (lang === "gu" ? s.name.gu : s.name.en).toLowerCase().includes(search.toLowerCase())
  );

  function addItem(s: any) {
    setItems([...items, {
      stock_item_id: s._id,
      name: lang === "gu" ? s.name.gu : s.name.en,
      quantity: 1,
      unit: s.unit,
      price_per_unit: s.price_per_unit,
      total: s.price_per_unit
    }]);
  }

  function updateItem(idx: number, qty: number) {
    const copy = [...items];
    copy[idx].quantity = qty;
    copy[idx].total = qty * copy[idx].price_per_unit;
    setItems(copy);
  }

  const subtotal = items.reduce((a, b) => a + b.total, 0);
  const balance = subtotal - advance;

  async function save() {
    if (!customerName || items.length === 0) {
      return toast.error("Name + items required");
    }
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items,
        subtotal,
        advance_paid: advance,
        balance_due: balance,
        expected_dispatch_date: expected || undefined,
      }),
    });
    if (res.ok) {
      toast.success(t("booking_saved"));
      onSaved();
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">Customer Name *</label>
          <input 
            className="premium-input" 
            placeholder="e.g. Ramesh Bhai"
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)} 
          />
        </div>

        <div>
          <label className="premium-label">Customer Phone *</label>
          <input 
            className="premium-input" 
            placeholder="e.g. 9876543210"
            value={customerPhone} 
            onChange={e => setCustomerPhone(e.target.value)} 
          />
        </div>
      </div>

      <div>
        <label className="premium-label">Address</label>
        <input 
          className="premium-input" 
          placeholder="Customer location/nursery"
          value={customerAddress} 
          onChange={e => setCustomerAddress(e.target.value)} 
        />
      </div>

      <div className="space-y-4">
        <label className="premium-label mb-0 block">Select Items</label>
        <div className="relative">
          <input 
            className="premium-input !pl-11" 
            placeholder="Type plant name to filter stock..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">🔍</span>
        </div>
        
        {search && filtered.length > 0 && (
          <div className="border border-neutral-200 bg-white rounded-xl max-h-36 overflow-y-auto shadow-premium-sm text-sm divide-y divide-neutral-100 z-10 relative">
            {filtered.slice(0, 6).map((s: any) => (
              <button 
                key={s._id} 
                onClick={() => { addItem(s); setSearch(""); }} 
                className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>{lang === "gu" ? s.name.gu : s.name.en}</span>
                <span className="font-bold text-primary">₹{s.price_per_unit}</span>
              </button>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2 mt-4">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-neutral-50 border border-neutral-200/60 p-3.5 rounded-xl text-sm justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-neutral-900 truncate">{it.name}</div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">Price: ₹{it.price_per_unit}/{it.unit}</div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    className="premium-input !h-9 !w-16 p-1 text-center" 
                    value={it.quantity} 
                    onChange={e => updateItem(idx, +e.target.value)} 
                  />
                  <div className="font-bold text-neutral-900">₹{it.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary-light/40 border border-primary/20 p-4 rounded-xl space-y-2 text-sm">
        <div className="flex justify-between font-medium">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-bold text-neutral-900">₹{subtotal}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Advance Paid</span>
          <input 
            type="number" 
            className="premium-input !h-9 !w-24 text-right" 
            value={advance} 
            onChange={e => setAdvance(+e.target.value)} 
          />
        </div>
        <div className="flex justify-between font-bold border-t border-primary/20 pt-2 text-primary">
          <span>Balance Due</span>
          <span>₹{balance}</span>
        </div>
      </div>

      <div>
        <label className="premium-label">Expected Dispatch Date</label>
        <input 
          type="date" 
          className="premium-input" 
          value={expected} 
          onChange={e => setExpected(e.target.value)} 
        />
      </div>

      <button 
        onClick={save} 
        className="btn-premium-primary w-full mt-4"
      >
        Save Booking
      </button>
    </div>
  );
}

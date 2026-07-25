"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";
import { Search, X, Package } from "lucide-react";

interface StockOption {
  _id: string;
  name: { en: string; gu: string };
  quantity: number;
  unit: string;
  price_per_unit: number;
  category_id?: any;
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
  const [showCatalog, setShowCatalog] = useState(false);
  const [withGst, setWithGst] = useState(false);
  const [gstPercent, setGstPercent] = useState(5);
  const [loading, setLoading] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        // keep open when typing; only collapse if empty search and click outside optional
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchStock() {
    const res = await fetch("/api/stock");
    const data = await res.json();
    setStockOptions(Array.isArray(data) ? data : []);
  }

  const filteredStock = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return stockOptions;
    return stockOptions.filter((s) => {
      const gu = s.name.gu.toLowerCase();
      const en = s.name.en.toLowerCase();
      const catGu = s.category_id?.name?.gu?.toLowerCase() || "";
      const catEn = s.category_id?.name?.en?.toLowerCase() || "";
      return gu.includes(q) || en.includes(q) || catGu.includes(q) || catEn.includes(q);
    });
  }, [stockOptions, searchTerm]);

  function addItem(stock: StockOption) {
    if (items.find((i) => i.stock_item_id === stock._id)) {
      toast.error("Item already added");
      return;
    }
    setItems([
      ...items,
      {
        stock_item_id: stock._id,
        name: lang === "gu" ? stock.name.gu : stock.name.en,
        quantity: 1,
        unit: stock.unit,
        price_per_unit: stock.price_per_unit,
        total: stock.price_per_unit,
        max_qty: stock.quantity,
      },
    ]);
    setSearchTerm("");
  }

  function updateQty(index: number, qty: number) {
    const updated = [...items];
    const safe = Math.max(1, Math.min(Number(qty) || 1, updated[index].max_qty || 999999));
    updated[index].quantity = safe;
    updated[index].total = updated[index].quantity * updated[index].price_per_unit;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
  const gstAmount = withGst ? Math.round((afterDiscount * (Number(gstPercent) || 0)) / 100) : 0;
  const final = afterDiscount + gstAmount;

  async function handleSubmit() {
    if (!customerName || items.length === 0) {
      toast.error("Customer name and at least one item required");
      return;
    }
    setLoading(true);

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      items: items.map(({ max_qty, ...rest }) => rest),
      subtotal,
      discount: Number(discount) || 0,
      with_gst: withGst,
      gst_percent: withGst ? Number(gstPercent) || 0 : 0,
      gst_amount: gstAmount,
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
    <div className="p-5 space-y-5 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden p-5 space-y-5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

        {/* Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="premium-label">{t("customer_name")} *</label>
            <input
              className="premium-input"
              placeholder="e.g. Valji Bhai"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label className="premium-label">
              {t("customer_phone")} ({t("optional")})
            </label>
            <input
              className="premium-input"
              placeholder="9876543210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stock catalog */}
      <div
        ref={catalogRef}
        className="bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md p-5 space-y-3"
      >
        <label className="premium-label mb-0 block">{t("select_from_stock")}</label>
        <div className="relative">
          <input
            className="premium-input !pl-11"
            placeholder={t("search_stock")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowCatalog(true);
            }}
            onFocus={() => setShowCatalog(true)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          {(searchTerm || showCatalog) && (
            <button
              type="button"
              onClick={() => {
                setShowCatalog(false);
                setSearchTerm("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {showCatalog && (
          <div className="border border-neutral-200 bg-neutral-50 rounded-xl max-h-56 overflow-y-auto shadow-premium-sm text-sm divide-y divide-neutral-100">
            {filteredStock.length === 0 ? (
              <div className="px-4 py-6 text-center text-neutral-500 text-xs">
                {t("no_stock")}
              </div>
            ) : (
              filteredStock.map((s) => {
                const selected = items.some((i) => i.stock_item_id === s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={selected || s.quantity <= 0}
                    onClick={() => addItem(s)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                      selected
                        ? "opacity-50 bg-neutral-100 cursor-not-allowed"
                        : "hover:bg-primary-light/40 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                        <Package size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 truncate">
                          {lang === "gu" ? s.name.gu : s.name.en}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {lang === "gu" ? s.name.en : s.name.gu}
                          {s.category_id?.name && (
                            <> · {lang === "gu" ? s.category_id.name.gu : s.category_id.name.en}</>
                          )}
                          {" · "}
                          {t("available")}: {s.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-primary flex-shrink-0 ml-2">
                      ₹{s.price_per_unit}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected items */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md p-5 space-y-3">
          <label className="premium-label">{t("selected_items")}</label>
          {items.map((item, index) => (
            <div
              key={item.stock_item_id}
              className="bg-neutral-50 border border-neutral-200/60 p-3.5 rounded-xl text-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 truncate">{item.name}</div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">
                    ₹{item.price_per_unit}/{t(item.unit as any) || item.unit}
                    {item.max_qty != null && (
                      <> · {t("available")}: {item.max_qty}</>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-danger hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                    {t("quantity")}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={item.max_qty || undefined}
                    className="premium-input !h-11 mt-1"
                    value={item.quantity}
                    onChange={(e) => updateQty(index, Number(e.target.value))}
                    placeholder={t("enter_qty")}
                  />
                </div>
                <div className="text-right pt-5">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase">
                    {t("total")}
                  </div>
                  <div className="font-bold text-neutral-900 text-base">₹{item.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals + GST */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md p-5 space-y-4">
          <div className="flex justify-between font-medium text-sm">
            <span className="text-neutral-600">{t("subtotal")}</span>
            <span className="font-bold text-neutral-900">₹{subtotal}</span>
          </div>

          <div className="flex justify-between items-center gap-3 text-sm">
            <span className="text-neutral-600">{t("discount")} (₹)</span>
            <input
              type="number"
              className="premium-input !h-11 !w-28 text-right"
              value={discount}
              min={0}
              onChange={(e) => setDiscount(+e.target.value)}
            />
          </div>

          {/* GST toggle */}
          <div>
            <label className="premium-label">{t("bill")}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWithGst(false)}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  !withGst
                    ? "text-white border-transparent shadow-premium-sm"
                    : "bg-white text-neutral-900 border-neutral-200"
                }`}
                style={
                  !withGst
                    ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" }
                    : undefined
                }
              >
                {t("without_gst")}
              </button>
              <button
                type="button"
                onClick={() => setWithGst(true)}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  withGst
                    ? "text-white border-transparent shadow-premium-sm"
                    : "bg-white text-neutral-900 border-neutral-200"
                }`}
                style={
                  withGst
                    ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" }
                    : undefined
                }
              >
                {t("with_gst")}
              </button>
            </div>
          </div>

          {withGst && (
            <div className="flex justify-between items-center gap-3 text-sm bg-primary-light/40 p-3 rounded-xl border border-primary/15">
              <span className="text-neutral-700 font-semibold">{t("gst_percent")}</span>
              <input
                type="number"
                className="premium-input !h-11 !w-24 text-right"
                value={gstPercent}
                min={0}
                max={100}
                step={0.5}
                onChange={(e) => setGstPercent(+e.target.value)}
              />
            </div>
          )}

          {withGst && (
            <div className="flex justify-between font-medium text-sm">
              <span className="text-neutral-600">
                {t("gst_amount")} ({gstPercent}%)
              </span>
              <span className="font-bold text-neutral-900">₹{gstAmount}</span>
            </div>
          )}

          <div className="flex justify-between font-bold border-t border-primary/20 pt-3 text-primary text-base">
            <span>{t("total")}</span>
            <span>₹{final}</span>
          </div>
        </div>
      )}

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-premium-md p-5 space-y-3">
        <label className="premium-label">{t("payment_method")}</label>
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
                style={
                  isSelected
                    ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" }
                    : undefined
                }
              >
                {t(p)}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !customerName || items.length === 0}
        className="btn-premium-primary w-full disabled:opacity-60"
      >
        {loading ? t("saving") : `📄 ${t("complete_sale")}`}
      </button>
    </div>
  );
}

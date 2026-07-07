"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";

interface StockFormProps {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
}

interface Category {
  _id: string;
  name: { en: string; gu: string };
  emoji?: string;
}

export default function StockForm({ initial, onSubmit, submitLabel }: StockFormProps) {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    name: { gu: initial?.name?.gu || "", en: initial?.name?.en || "" },
    category_id: initial?.category_id || "",
    quantity: initial?.quantity || "",
    unit: initial?.unit || "piece",
    price_per_unit: initial?.price_per_unit || "",
    condition: initial?.condition || "healthy",
    mature_date: initial?.mature_date ? initial.mature_date.slice(0, 10) : "",
    notes: initial?.notes || "",
    image: initial?.image || "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...form,
      quantity: Number(form.quantity),
      price_per_unit: Number(form.price_per_unit),
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">Name (Gujarati) *</label>
          <input 
            className="premium-input" 
            placeholder="દા.ત. ટામેટા રોપા" 
            value={form.name.gu} 
            onChange={(e) => setForm({ ...form, name: { ...form.name, gu: e.target.value } })} 
            required 
          />
        </div>

        <div>
          <label className="premium-label">Name (English) *</label>
          <input 
            className="premium-input" 
            placeholder="e.g. Tomato Saplings" 
            value={form.name.en} 
            onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })} 
            required 
          />
        </div>
      </div>

      <div>
        <label className="premium-label">Category *</label>
        <div className="relative">
          <select 
            className="premium-input appearance-none" 
            value={form.category_id} 
            onChange={(e) => setForm({ ...form, category_id: e.target.value })} 
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.emoji || ''} {lang === 'gu' ? cat.name.gu : cat.name.en}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
            ▼
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">{t("quantity") || "Quantity"} *</label>
          <input 
            type="number" 
            className="premium-input" 
            placeholder="0" 
            value={form.quantity} 
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
            required 
          />
        </div>
        <div>
          <label className="premium-label">{t("unit") || "Unit"} *</label>
          <div className="relative">
            <select 
              className="premium-input appearance-none" 
              value={form.unit} 
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {["piece", "kg", "gram", "packet", "bundle", "tray"].map((u) => (
                <option key={u} value={u}>{t(u as any) || u}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">{t("price") || "Price"} / Unit (₹) *</label>
          <input 
            type="number" 
            className="premium-input" 
            placeholder="₹ 0.00" 
            value={form.price_per_unit} 
            onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} 
            required 
          />
        </div>
        <div>
          <label className="premium-label">{t("mature_date") || "Expected Mature Date"}</label>
          <input 
            type="date" 
            className="premium-input" 
            value={form.mature_date} 
            onChange={(e) => setForm({ ...form, mature_date: e.target.value })} 
          />
        </div>
      </div>

      <div>
        <label className="premium-label">Plant Condition *</label>
        <div className="grid grid-cols-3 gap-3">
          {["healthy", "average", "poor"].map((c) => {
            const isSelected = form.condition === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, condition: c })}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  isSelected 
                    ? c === "healthy" ? "bg-success/10 text-success border-success/30 shadow-premium-sm" :
                      c === "average" ? "bg-warning/10 text-warning border-warning/30 shadow-premium-sm" :
                      "bg-danger/10 text-danger border-danger/30 shadow-premium-sm"
                    : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {t(c as any) || c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">Base Catalog Photo</label>
          <div className="border border-dashed border-neutral-200 bg-neutral-50 hover:bg-neutral-100/55 rounded-xl p-4 transition-colors flex flex-col items-center justify-center relative min-h-[140px] cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setForm(f => ({ ...f, image: ev.target?.result as string }));
                  setUploading(false);
                };
                reader.readAsDataURL(file);
              }} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {form.image ? (
              <img src={form.image} className="w-20 h-20 object-cover rounded-xl shadow-premium-sm" alt="preview" />
            ) : (
              <div className="text-center space-y-1">
                <div className="text-2xl text-neutral-600">📸</div>
                <div className="text-xs font-bold text-neutral-900">Upload Base Image</div>
                <div className="text-[10px] text-neutral-600">Tap or drag files here</div>
              </div>
            )}
            {uploading && <div className="text-xs text-primary font-bold animate-pulse mt-2">Uploading...</div>}
          </div>
        </div>

        <div>
          <label className="premium-label">Condition Inspection Photo</label>
          <div className="border border-dashed border-neutral-200 bg-neutral-50 hover:bg-neutral-100/55 rounded-xl p-4 transition-colors flex flex-col items-center justify-center relative min-h-[140px] cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target?.result as string || f.image }));
                reader.readAsDataURL(file);
              }} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {form.image ? (
              <img src={form.image} className="w-20 h-20 object-cover rounded-xl shadow-premium-sm" alt="preview" />
            ) : (
              <div className="text-center space-y-1">
                <div className="text-2xl text-neutral-600">🛡️</div>
                <div className="text-xs font-bold text-neutral-900">Condition Check Photo</div>
                <div className="text-[10px] text-neutral-600">Tap to upload fresh inspect</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="premium-label">{t("notes") || "Notes / Description"}</label>
        <textarea 
          className="premium-input !h-auto py-3 min-h-[100px]" 
          placeholder="e.g. Row 5, batch seeded mid-february..."
          value={form.notes} 
          onChange={(e) => setForm({ ...form, notes: e.target.value })} 
        />
      </div>

      <div className="pt-2 flex gap-4 justify-end">
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-premium-primary w-full sm:w-auto"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

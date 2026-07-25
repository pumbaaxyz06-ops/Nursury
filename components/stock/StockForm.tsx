"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LanguageContext";
import { useSearchParams } from "next/navigation";

interface StockFormProps {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
  readOnly?: boolean;
}

interface Category {
  _id: string;
  name: { en: string; gu: string };
  emoji?: string;
}

export default function StockForm({
  initial,
  onSubmit,
  submitLabel,
  readOnly = false,
}: StockFormProps) {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const preCategory = searchParams?.get("category") || "";

  const isEdit = Boolean(initial?._id || initial?.name);
  const hideVarietyDropdown = isEdit || Boolean(preCategory) || Boolean(initial?.category_id);

  const [form, setForm] = useState({
    name: { gu: initial?.name?.gu || "", en: initial?.name?.en || "" },
    category_id:
      (typeof initial?.category_id === "object"
        ? initial?.category_id?._id
        : initial?.category_id) ||
      preCategory ||
      "",
    quantity: initial?.quantity ?? "",
    unit: initial?.unit || "piece",
    price_per_unit: initial?.price_per_unit !== undefined && initial?.price_per_unit !== null ? String(initial.price_per_unit) : "",
    condition: initial?.condition || "healthy",
    mature_date: initial?.mature_date ? String(initial.mature_date).slice(0, 10) : "",
    notes: initial?.notes || "",
    image: initial?.image || "",
    condition_image: initial?.condition_image || "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const catList = Array.isArray(data) ? data : [];
        setCategories(catList);
        // If category_id is missing but preCategory or catList exists, auto select
        if (!form.category_id && preCategory) {
          setForm((f) => ({ ...f, category_id: preCategory }));
        } else if (!form.category_id && catList.length > 0 && !hideVarietyDropdown) {
          setForm((f) => ({ ...f, category_id: catList[0]._id }));
        }
      })
      .catch(() => {});
  }, [preCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setLoading(true);

    const parsedPrice = parseFloat(String(form.price_per_unit)) || 0;
    const parsedQty = parseFloat(String(form.quantity)) || 0;

    await onSubmit({
      ...form,
      quantity: parsedQty,
      price_per_unit: parsedPrice,
    });
    setLoading(false);
  };

  const disabled = readOnly;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-neutral-200/80 shadow-premium-md relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">{t("name_gu")} *</label>
          <input
            className="premium-input"
            placeholder="દા.ત. હાઇબ્રિડ ટામેટા"
            value={form.name.gu}
            onChange={(e) => setForm({ ...form, name: { ...form.name, gu: e.target.value } })}
            required
            disabled={disabled}
          />
        </div>

        <div>
          <label className="premium-label">{t("name_en")} *</label>
          <input
            className="premium-input"
            placeholder="e.g. Hybrid Tomato"
            value={form.name.en}
            onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
            required
            disabled={disabled}
          />
        </div>
      </div>

      {/* Hide Variety dropdown when adding stock from category or editing existing stock */}
      {!hideVarietyDropdown && (
        <div>
          <label className="premium-label">{t("variety")} *</label>
          <div className="relative">
            <select
              className="premium-input appearance-none cursor-pointer"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required={!hideVarietyDropdown}
              disabled={disabled}
            >
              <option value="">{t("select_variety")}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.emoji || ""} {lang === "gu" ? cat.name.gu : cat.name.en}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600">
              ▼
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="premium-label">{t("quantity")} *</label>
          <input
            type="number"
            step="any"
            className="premium-input"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
            disabled={disabled}
            min={0}
          />
        </div>
        <div>
          <label className="premium-label">{t("unit")} *</label>
          <div className="relative">
            <select
              className="premium-input appearance-none cursor-pointer"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              disabled={disabled}
            >
              {(["piece", "kg", "gram", "packet", "bundle", "tray"] as const).map((u) => (
                <option key={u} value={u}>
                  {t(u)}
                </option>
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
          <label className="premium-label">
            {t("price")} / Unit (₹) *
          </label>
          <input
            type="number"
            step="any"
            className="premium-input font-bold text-neutral-900"
            placeholder="₹ 0.00"
            value={form.price_per_unit}
            onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
            required
            disabled={disabled}
            min={0}
          />
        </div>
        <div>
          <label className="premium-label">{t("mature_date")}</label>
          <input
            type="date"
            className="premium-input"
            value={form.mature_date}
            onChange={(e) => setForm({ ...form, mature_date: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label className="premium-label">{t("plant_condition")} *</label>
        <div className="grid grid-cols-3 gap-3">
          {(["healthy", "average", "poor"] as const).map((c) => {
            const isSelected = form.condition === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => !disabled && setForm({ ...form, condition: c })}
                disabled={disabled}
                className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? c === "healthy"
                      ? "bg-success/10 text-success border-success/30 shadow-premium-sm"
                      : c === "average"
                        ? "bg-warning/10 text-warning border-warning/30 shadow-premium-sm"
                        : "bg-danger/10 text-danger border-danger/30 shadow-premium-sm"
                    : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
                } ${disabled ? "opacity-80 cursor-default" : ""}`}
              >
                {t(c)}
              </button>
            );
          })}
        </div>
      </div>

      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="premium-label">{t("upload_photo")}</label>
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
                    setForm((f) => ({ ...f, image: (ev.target?.result as string) || "" }));
                    setUploading(false);
                  };
                  reader.readAsDataURL(file);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {form.image ? (
                <img
                  src={form.image}
                  className="w-20 h-20 object-cover rounded-xl shadow-premium-sm"
                  alt="preview"
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="text-2xl text-neutral-600">📸</div>
                  <div className="text-xs font-bold text-neutral-900">{t("upload_photo")}</div>
                </div>
              )}
              {uploading && (
                <div className="text-xs text-primary font-bold animate-pulse mt-2">{t("saving")}</div>
              )}
            </div>
          </div>

          <div>
            <label className="premium-label">{t("condition_photo")}</label>
            <div className="border border-dashed border-neutral-200 bg-neutral-50 hover:bg-neutral-100/55 rounded-xl p-4 transition-colors flex flex-col items-center justify-center relative min-h-[140px] cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setForm((f) => ({
                      ...f,
                      condition_image: (ev.target?.result as string) || f.condition_image,
                    }));
                  reader.readAsDataURL(file);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {form.condition_image || form.image ? (
                <img
                  src={form.condition_image || form.image}
                  className="w-20 h-20 object-cover rounded-xl shadow-premium-sm"
                  alt="preview"
                />
              ) : (
                <div className="text-center space-y-1">
                  <div className="text-2xl text-neutral-600">🛡️</div>
                  <div className="text-xs font-bold text-neutral-900">{t("condition_photo")}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {readOnly && form.image && (
        <div>
          <label className="premium-label">{t("upload_photo")}</label>
          <img
            src={form.image}
            alt=""
            className="w-full max-h-48 object-cover rounded-xl border border-neutral-200"
          />
        </div>
      )}

      <div>
        <label className="premium-label">{t("notes")}</label>
        <textarea
          className="premium-input !h-auto py-3 min-h-[100px]"
          placeholder="..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          disabled={disabled}
        />
      </div>

      {!readOnly && (
        <div className="pt-2 flex gap-4 justify-end">
          <button type="submit" disabled={loading} className="btn-premium-primary w-full sm:w-auto cursor-pointer">
            {loading ? t("saving") : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

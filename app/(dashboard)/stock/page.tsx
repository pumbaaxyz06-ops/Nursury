"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { Search, Plus, Trash2, ArrowLeft } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LangToggle from "@/components/ui/LangToggle";
import { toast } from "sonner";

interface StockItem {
  _id: string;
  name: { en: string; gu: string };
  quantity: number;
  unit: string;
  price_per_unit: number;
  condition: string;
  mature_date?: string;
  image?: string;
  category_id?: any;
}

function StockListContent() {
  const { t, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterVariety, setFilterVariety] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const initialCategory = searchParams.get("category") || "";

  async function loadStock() {
    setLoading(true);
    const params = new URLSearchParams();
    if (initialCategory) params.set("category", initialCategory);

    const res = await fetch(`/api/stock?${params.toString()}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadStock();
    setFilterVariety("");
    setSearch("");
    setFilterCondition("");
    setFilterLow(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory]);

  // Dynamic variety filters from actual stock under this list
  const varietyFilters = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      const key = i.name.en || i.name.gu;
      const label = lang === "gu" ? i.name.gu : i.name.en;
      if (key) map.set(key, label);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [items, lang]);

  const displayItems = useMemo(() => {
    let res = items;
    const s = search.trim().toLowerCase();
    if (s) {
      res = res.filter(
        (i) =>
          i.name.gu.toLowerCase().includes(s) ||
          i.name.en.toLowerCase().includes(s)
      );
    }
    if (filterCondition) {
      res = res.filter((i) => i.condition === filterCondition);
    }
    if (filterVariety) {
      res = res.filter(
        (i) => i.name.en === filterVariety || i.name.gu === filterVariety
      );
    }
    if (filterLow) {
      res = res.filter((i) => i.quantity < 20);
    }
    return res;
  }, [items, search, filterCondition, filterVariety, filterLow]);

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/stock/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("delete"));
        loadStock();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
    setDeleteId(null);
  }

  const pillActive = (active: boolean, danger = false) =>
    active
      ? {
          className:
            "px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer text-white shadow-premium-sm text-xs",
          style: {
            background: danger
              ? "linear-gradient(135deg, #EF5350, #D32F2F)"
              : "linear-gradient(135deg, #306D29, #4CAF50)",
          },
        }
      : {
          className:
            "px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 text-xs",
          style: undefined as React.CSSProperties | undefined,
        };

  return (
    <div className="flex-grow pb-24">
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <div className="flex items-center gap-2 text-white min-w-0">
          {initialCategory && (
            <button
              onClick={() => router.push("/home")}
              className="p-2 -ml-1 hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white truncate">{t("stock")}</h1>
        </div>
        <LangToggle className="bg-white/10 border border-white/20 text-white" />
      </div>

      <div className="px-5 py-6 max-w-7xl mx-auto w-full space-y-5">
        {initialCategory && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold">
            {t("filtered_by_category")}
          </div>
        )}

        <div className="relative w-full">
          <input
            className="premium-input !pl-11"
            placeholder={t("search_stock")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
        </div>

        {/* Dynamic variety filters from stock */}
        {varietyFilters.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {t("variety")}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterVariety("")}
                {...pillActive(!filterVariety)}
              >
                {t("all_varieties")}
              </button>
              {varietyFilters.map((v) => {
                const active = filterVariety === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setFilterVariety(active ? "" : v.key)}
                    {...pillActive(active)}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition + low stock */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setFilterCondition("");
              setFilterLow(false);
            }}
            {...pillActive(!filterCondition && !filterLow)}
          >
            {t("filter_all")}
          </button>
          {(["healthy", "average", "poor"] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilterCondition(c);
                setFilterLow(false);
              }}
              {...pillActive(filterCondition === c)}
            >
              {t(c)}
            </button>
          ))}
          <button
            onClick={() => {
              setFilterLow(true);
              setFilterCondition("");
            }}
            {...pillActive(filterLow, true)}
          >
            ▲ {t("low_stock")}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-neutral-200 animate-pulse shadow-premium-sm" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
            <span className="text-4xl mb-3">🌿</span>
            <h3 className="text-base font-bold text-neutral-900">{t("no_stock")}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayItems.map((item) => (
              <div
                key={item._id}
                className="premium-card flex gap-3 active:scale-[0.98] cursor-pointer relative"
                onClick={() => router.push(`/stock/${item._id}`)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(item._id);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white border border-neutral-200 text-danger flex items-center justify-center shadow-premium-sm hover:bg-red-50"
                  title={t("delete")}
                >
                  <Trash2 size={14} />
                </button>
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0 shadow-premium-sm">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    "🌱"
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between pr-8">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-neutral-900 truncate">
                        {lang === "gu" ? item.name.gu : item.name.en}
                      </span>
                      <span className="font-bold text-primary flex-shrink-0">
                        ₹{item.price_per_unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      {lang === "gu" ? item.name.en : item.name.gu}
                      {item.category_id?.name && (
                        <> · {lang === "gu" ? item.category_id.name.gu : item.category_id.name.en}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="qty-badge bg-primary-light text-primary font-bold text-xs py-1 px-2.5 rounded-lg">
                      {t("stock")}: {item.quantity} {t(item.unit as any) || item.unit}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.condition === "healthy"
                          ? "bg-success/10 text-success"
                          : item.condition === "average"
                            ? "bg-warning/10 text-warning"
                            : "bg-danger/10 text-danger"
                      }`}
                    >
                      {t(item.condition as any) || item.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() =>
          router.push(
            initialCategory ? `/stock/add?category=${initialCategory}` : "/stock/add"
          )
        }
        className="premium-fab"
        aria-label={t("add_stock")}
      >
        <Plus size={24} />
      </button>

      <ConfirmDialog
        open={!!deleteId}
        title={t("delete_stock")}
        message={t("delete_stock_msg")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default function StockListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading stock...</div>}>
      <StockListContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import { Search, Plus, Trash2, ArrowLeft, Package, Sparkles } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserHeaderMenu from "@/components/ui/UserHeaderMenu";
import LangToggle from "@/components/ui/LangToggle";
import AddCategoryModal from "@/components/AddCategoryModal";
import PlantSVG from "@/components/PlantSVG";
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

interface Category {
  _id: string;
  name: { en: string; gu: string };
  emoji: string;
  image: string;
  totalQuantity: number;
}

function StockPageContent() {
  const { t, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category") || "";

  // Category Grid State
  const [categories, setCategories] = useState<Category[]>([]);
  const [catSearch, setCatSearch] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Stock Items State (when category selected or view all)
  const [items, setItems] = useState<StockItem[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterVariety, setFilterVariety] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteStockId, setDeleteStockId] = useState<string | null>(null);

  // Fetch categories when no category is selected
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch stock items when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      loadStock(selectedCategoryId);
      setFilterVariety("");
      setStockSearch("");
      setFilterCondition("");
      setFilterLow(false);
    }
  }, [selectedCategoryId]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadStock(catId?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (catId) params.set("category", catId);

    const res = await fetch(`/api/stock?${params.toString()}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.gu.toLowerCase().includes(q) ||
      c.name.en.toLowerCase().includes(q) ||
      (c.emoji || "").includes(q)
    );
  });

  // Dynamic variety filters from actual stock
  const varietyFilters = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      const key = i.name.en || i.name.gu;
      const label = lang === "gu" ? i.name.gu : i.name.en;
      if (key) map.set(key, label);
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [items, lang]);

  const displayStockItems = useMemo(() => {
    let res = items;
    const s = stockSearch.trim().toLowerCase();
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
  }, [items, stockSearch, filterCondition, filterVariety, filterLow]);

  async function confirmDeleteCategory() {
    if (!deleteCatId) return;
    try {
      const res = await fetch(`/api/categories/${deleteCatId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("delete"));
        fetchCategories();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
    setDeleteCatId(null);
  }

  async function confirmDeleteStock() {
    if (!deleteStockId) return;
    try {
      const res = await fetch(`/api/stock/${deleteStockId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("delete"));
        if (selectedCategoryId) loadStock(selectedCategoryId);
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
    setDeleteStockId(null);
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

  const totalStockItemsCount = categories.reduce((sum, c) => sum + c.totalQuantity, 0);
  const selectedCategoryObj = categories.find((c) => c._id === selectedCategoryId);

  return (
    <div className="flex-grow pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <div className="flex items-center gap-2 text-white min-w-0">
          {selectedCategoryId && (
            <button
              onClick={() => router.push("/stock")}
              className="p-2 -ml-1 hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold text-white truncate">
            {selectedCategoryObj
              ? lang === "gu"
                ? selectedCategoryObj.name.gu
                : selectedCategoryObj.name.en
              : t("stock")}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <LangToggle className="bg-white/10 border border-white/20 text-white" />
          <UserHeaderMenu />
        </div>
      </div>

      <div className="px-5 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* IF NO CATEGORY SELECTED -> SHOW YOUR NURSERY CATEGORIES GRID */}
        {!selectedCategoryId ? (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(48,109,41,0.25)] border-0 !p-4"
                style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
              >
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
                  {t("total_stock_items")}
                </div>
                <div className="text-3xl font-extrabold text-white leading-none">
                  {totalStockItemsCount.toLocaleString()}
                </div>
              </div>

              <div
                className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(30,77,25,0.2)] border-0 !p-4"
                style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
              >
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
                  {t("plant_categories")}
                </div>
                <div className="text-3xl font-extrabold text-white leading-none">
                  {categories.length}
                </div>
              </div>
            </div>

            {/* Your Nursery Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{t("your_nursery")}</h2>
                <p className="text-xs text-neutral-600 mt-1">{t("tap_category")}</p>
              </div>

              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <input
                    className="premium-input !pl-11"
                    placeholder={t("search_categories")}
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                </div>
                <button
                  onClick={() => setShowAddCat(true)}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-[#306D29] to-[#4CAF50] rounded-xl flex-shrink-0 cursor-pointer shadow-premium-sm text-white hover:opacity-95 active:scale-95 transition-all"
                  title={t("add_new_category")}
                >
                  <Plus size={24} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const isLow = cat.totalQuantity > 0 && cat.totalQuantity < 20;
                    const qty = cat.totalQuantity;
                    const nameGu = cat.name.gu;
                    const nameEn = cat.name.en;
                    const displayName = lang === "gu" ? nameGu : nameEn;
                    const subName = lang === "gu" ? nameEn : nameGu;
                    return (
                      <div key={cat._id} className="premium-card !p-0 overflow-hidden flex flex-col group relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCatId(cat._id);
                          }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 border border-neutral-200 text-danger flex items-center justify-center shadow-premium-sm hover:bg-red-50 cursor-pointer"
                          title={t("delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => router.push(`/stock?category=${cat._id}`)}
                          className="text-left flex flex-col flex-grow cursor-pointer"
                        >
                          <div className="h-28 w-full flex items-center justify-center bg-gradient-to-b from-primary-light/40 to-white/10 relative overflow-hidden">
                            {cat.image && !cat.image.includes("placeholder") && !cat.image.includes("via.placeholder") ? (
                              <img
                                src={cat.image}
                                alt={displayName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="group-hover:scale-110 transition-transform duration-300 ease-out">
                                <PlantSVG type={nameEn} emoji={cat.emoji} size={84} />
                              </div>
                            )}
                          </div>
                          <div className="p-4 bg-white w-full border-t border-neutral-100 flex-grow flex flex-col justify-between">
                            <div>
                              <div className="text-base font-bold text-neutral-900 leading-snug group-hover:text-primary transition-colors">
                                {displayName}
                              </div>
                              <div className="text-xs text-neutral-600 font-medium mt-0.5">{subName}</div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="qty-badge bg-primary-light text-primary font-bold text-xs py-1 px-2.5 rounded-lg">
                                {qty}{" "}
                                <span className="text-[10px] font-normal text-neutral-600 ml-0.5">
                                  {t("piece")}
                                </span>
                              </div>
                              {isLow && (
                                <span
                                  className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold animate-pulse"
                                  title={t("low_stock_warning")}
                                >
                                  ⚠
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
                    <span className="text-4xl mb-3">🌱</span>
                    <h3 className="text-base font-bold text-neutral-900">{t("no_categories")}</h3>
                    <p className="text-xs text-neutral-600 mt-1 max-w-xs">{t("tap_category")}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* IF CATEGORY IS SELECTED -> SHOW VARIETY STOCK ITEMS LIST */
          <>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold">
                Category Stock Items
              </div>
              <button
                onClick={() => router.push("/stock")}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                View All Categories →
              </button>
            </div>

            <div className="relative w-full">
              <input
                className="premium-input !pl-11"
                placeholder={t("search_stock")}
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
            </div>

            {/* Dynamic variety filters */}
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

            {/* Condition + low stock filters */}
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

            {/* Stock items list */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-neutral-200 animate-pulse shadow-premium-sm" />
                ))}
              </div>
            ) : displayStockItems.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
                <span className="text-4xl mb-3">🌿</span>
                <h3 className="text-base font-bold text-neutral-900">{t("no_stock")}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {displayStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="premium-card flex gap-3 active:scale-[0.98] cursor-pointer relative"
                    onClick={() => router.push(`/stock/${item._id}`)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteStockId(item._id);
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white border border-neutral-200 text-danger flex items-center justify-center shadow-premium-sm hover:bg-red-50 cursor-pointer"
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
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() =>
          selectedCategoryId
            ? router.push(`/stock/add?category=${selectedCategoryId}`)
            : setShowAddCat(true)
        }
        className="premium-fab cursor-pointer"
        aria-label="Add"
      >
        <Plus size={24} />
      </button>

      {/* Add Category Modal */}
      <AddCategoryModal
        open={showAddCat}
        onClose={() => setShowAddCat(false)}
        onAdded={fetchCategories}
      />

      {/* Confirm Delete Category Modal */}
      <ConfirmDialog
        open={!!deleteCatId}
        title={t("delete_category")}
        message={t("delete_category_msg")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        danger
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCatId(null)}
      />

      {/* Confirm Delete Stock Item Modal */}
      <ConfirmDialog
        open={!!deleteStockId}
        title={t("delete_stock")}
        message={t("delete_stock_msg")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        danger
        onConfirm={confirmDeleteStock}
        onCancel={() => setDeleteStockId(null)}
      />
    </div>
  );
}

export default function StockListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading stock...</div>}>
      <StockPageContent />
    </Suspense>
  );
}

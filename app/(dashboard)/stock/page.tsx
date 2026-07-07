"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/LanguageContext";
import { Search, Plus } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const initialCategory = searchParams.get("category") || "";

  async function loadStock() {
    setLoading(true);
    const params = new URLSearchParams();
    if (initialCategory) params.set("category", initialCategory);
    if (search) params.set("search", search);
    if (filterCondition) params.set("condition", filterCondition);

    const res = await fetch(`/api/stock?${params.toString()}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterCondition, initialCategory]);

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const displayItems = (() => {
    let res = items;
    const s = search.toLowerCase();
    if (s && !["tomato","chilli"].includes(s) && s !== "low") {
      res = res.filter(i => 
        i.name.gu.toLowerCase().includes(s) || i.name.en.toLowerCase().includes(s)
      );
    }
    if (filterCondition) {
      res = res.filter(i => i.condition === filterCondition);
    }
    if (s === "low") {
      res = res.filter(i => i.quantity < 20);
    }
    return res;
  })();

  return (
    <div className="flex-grow pb-24">
      {/* Premium #306D29 Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <h1 className="text-lg font-bold text-white">{t("stock") || "Stock Inventory"}</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/stock/add")}
            className="btn-premium-primary !h-10 text-xs py-2 px-4 !bg-white/10 !text-white hover:!bg-white/20 border border-white/25 shadow-none"
          >
            <Plus size={16} /> Add Stock
          </button>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
        {initialCategory && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold">
            <span>Filtered by Category</span>
          </div>
        )}

        {/* Spacious, premium Search & Filters */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md">
            <input
              className="premium-input !pl-11"
              placeholder={t("search_stock") || "Search plants by name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          </div>

          {/* Segmented Filter Control */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => { setSearch(""); setFilterCondition(""); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${(!search && !filterCondition) ? "text-white shadow-premium-sm" : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"}`}
              style={(!search && !filterCondition) ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" } : undefined}
            >
              All
            </button>
            <button 
              onClick={() => { setSearch("tomato"); setFilterCondition(""); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${search.includes("tomato") ? "text-white shadow-premium-sm" : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"}`}
              style={search.includes("tomato") ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" } : undefined}
            >
              Tomato
            </button>
            <button 
              onClick={() => { setSearch("chilli"); setFilterCondition(""); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${search.includes("chilli") ? "text-white shadow-premium-sm" : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"}`}
              style={search.includes("chilli") ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" } : undefined}
            >
              Chilli
            </button>
            <button 
              onClick={() => { setFilterCondition("healthy"); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${filterCondition === "healthy" ? "text-white shadow-premium-sm" : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"}`}
              style={filterCondition === "healthy" ? { background: "linear-gradient(135deg, #306D29, #4CAF50)" } : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${filterCondition === "healthy" ? "bg-white" : "bg-success"}`}></span> Healthy
            </button>
            <button 
              onClick={() => { setSearch("low"); setFilterCondition(""); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${search === "low" ? "text-white shadow-premium-sm" : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"}`}
              style={search === "low" ? { background: "linear-gradient(135deg, #EF5350, #D32F2F)" } : undefined}
            >
              ▲ Low Stock
            </button>
          </div>
        </div>

        {/* Stock list container */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-neutral-200 animate-pulse shadow-premium-sm" />)}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
            <span className="text-4xl mb-3">🌿</span>
            <h3 className="text-base font-bold text-neutral-900">No stock found</h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs">There are no plant stocks in the inventory matching this query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayItems.map((item) => (
              <div 
                key={item._id} 
                onClick={() => router.push(`/stock/${item._id}`)}
                className="premium-card flex gap-4 active:scale-[0.98] cursor-pointer"
              >
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0 shadow-premium-sm">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : "🍅"}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-neutral-900 truncate pr-2">
                        {lang === "gu" ? item.name.gu : item.name.en}
                      </span>
                      <span className="font-bold text-primary flex-shrink-0">
                        ₹{item.price_per_unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      {lang === "gu" ? item.name.en : item.name.gu} • Tomato
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="qty-badge bg-primary-light text-primary font-bold text-xs py-1 px-2.5 rounded-lg">
                      Stock: {item.quantity}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.condition === "healthy" ? "bg-success/10 text-success" : 
                      item.condition === "average" ? "bg-warning/10 text-warning" : 
                      "bg-danger/10 text-danger"
                    }`}>
                      {t(item.condition as any) || item.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => router.push("/stock/add")} className="premium-fab">
        <Plus size={24} />
      </button>
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

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LangToggle from "@/components/ui/LangToggle";
import { useLang } from "@/lib/LanguageContext";
import { Plus, Search } from "lucide-react";
import AddCategoryModal from "@/components/AddCategoryModal";
import PlantSVG from "@/components/PlantSVG";

interface Category {
  _id: string;
  name: { en: string; gu: string };
  emoji: string;
  image: string;
  totalQuantity: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const filteredCategories = categories.filter(c =>
    (lang === "gu" ? c.name.gu : c.name.en).toLowerCase().includes(catSearch.toLowerCase())
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchCategories();
  }, [status]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const nurseryName = (session?.user as any)?.nursery_name || "My Nursery";

  const totalItems = categories.reduce((sum, c) => sum + c.totalQuantity, 0);
  const lowStockCount = categories.filter(c => c.totalQuantity > 0 && c.totalQuantity < 10).length;

  const getPlantImage = (nameEn: string, nameGu: string) => {
    const key = (nameEn || nameGu || '').toLowerCase();
    if (key.includes('tomato')) return 'https://picsum.photos/id/1011/120/120'; // nice red
    if (key.includes('chilli') || key.includes('chili') || key.includes('મરચું')) return 'https://picsum.photos/id/292/120/120';
    if (key.includes('cabbage') || key.includes('કોબી')) return 'https://picsum.photos/id/312/120/120';
    if (key.includes('brinjal') || key.includes('eggplant') || key.includes('રીંગણ')) return 'https://picsum.photos/id/201/120/120';
    if (key.includes('marigold') || key.includes('મરીગોલ્ડ')) return 'https://picsum.photos/id/160/120/120';
    if (key.includes('rose') || key.includes('ગુલાબ')) return 'https://picsum.photos/id/251/120/120';
    return 'https://picsum.photos/id/160/120/120'; // default plant
  };

  return (
    <div className="flex-grow pb-12">
      {/* Premium #306D29 Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <div>
          <div className="text-xs font-bold tracking-wider text-emerald-100 uppercase">{t("app_name") || "Vriksh"}</div>
          <h1 className="text-lg font-bold text-white mt-0.5">{nurseryName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle className="bg-white/10 border border-white/20 text-white" />
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats Grid - nature inspired gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div 
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(48,109,41,0.25)] border-0"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/15 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-premium-sm">
              🌿
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Total Stock Items</div>
            <div className="text-4xl font-extrabold text-white leading-none">{totalItems}</div>
            <div className="text-xs text-emerald-100/90 font-semibold mt-3 flex items-center gap-1">
              <span>📈 +12% this week</span>
            </div>
          </div>

          <div 
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(30,77,25,0.2)] border-0"
            style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
          >
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/15 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-premium-sm">
              📁
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Plant Categories</div>
            <div className="text-4xl font-extrabold text-white leading-none">{categories.length}</div>
            <div className="text-xs text-white/70 font-semibold mt-3">
              Active plant types in nursery
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{t("your_nursery") || "Your Plants"}</h2>
            <p className="text-xs text-neutral-600 mt-1">Tap a category to manage stock items</p>
          </div>

          {/* Search bar and Plus button in a clean row */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                className="premium-input !pl-11"
                placeholder={t("search_category") || "Search categories..."}
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
            </div>
            <button
              onClick={() => setShowAddCat(true)}
              className="w-12 h-12 flex items-center justify-center btn-premium-primary rounded-xl flex-shrink-0 cursor-pointer shadow-premium-sm text-white text-3xl font-light pb-1 select-none"
              title="Add Category"
            >
              +
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-neutral-200 animate-pulse shadow-premium-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, idx) => {
                  const isLow = cat.totalQuantity > 0 && cat.totalQuantity < 20;
                  const qty = cat.totalQuantity;
                  const nameGu = cat.name.gu;
                  const nameEn = cat.name.en;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => router.push(`/stock?category=${cat._id}`)}
                      className="premium-card !p-0 overflow-hidden text-left flex flex-col group relative"
                    >
                      <div className="h-28 w-full flex items-center justify-center bg-gradient-to-b from-primary-light/40 to-white/10 relative overflow-hidden">
                        <div className="group-hover:scale-110 transition-transform duration-300 ease-out">
                          <PlantSVG type={nameEn} size={84} />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                      </div>
                      <div className="p-4 bg-white w-full border-t border-neutral-100 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="text-base font-bold text-neutral-900 leading-snug group-hover:text-primary transition-colors">{nameGu}</div>
                          <div className="text-xs text-neutral-600 font-medium mt-0.5">{nameEn}</div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="qty-badge bg-primary-light text-primary font-bold text-xs py-1 px-2.5 rounded-lg">
                            {qty} <span className="text-[10px] font-normal text-neutral-600 ml-0.5">નંગ</span>
                          </div>
                          {isLow && (
                            <span 
                              className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold animate-pulse" 
                              title="Low Stock"
                            >
                              ⚠
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
                  <span className="text-4xl mb-3">🌱</span>
                  <h3 className="text-base font-bold text-neutral-900">No plant categories</h3>
                  <p className="text-xs text-neutral-600 mt-1 max-w-xs">No categories match your search term or are registered in the system.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <AddCategoryModal
          open={showAddCat}
          onClose={() => setShowAddCat(false)}
          onAdded={fetchCategories}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import LangToggle from "@/components/ui/LangToggle";
import { useLang } from "@/lib/LanguageContext";
import { Plus, Search, LogOut, Trash2 } from "lucide-react";
import AddCategoryModal from "@/components/AddCategoryModal";
import PlantSVG from "@/components/PlantSVG";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.gu.toLowerCase().includes(q) ||
      c.name.en.toLowerCase().includes(q) ||
      (c.emoji || "").includes(q)
    );
  });

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
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("delete"));
        fetchCategories();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
    setDeleteId(null);
  }

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const nurseryName = (session?.user as any)?.nursery_name || "My Nursery";
  const totalItems = categories.reduce((sum, c) => sum + c.totalQuantity, 0);

  return (
    <div className="flex-grow pb-8">
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wider text-emerald-100 uppercase">
            {t("app_name")}
          </div>
          <h1 className="text-lg font-bold text-white mt-0.5 truncate">{nurseryName}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <LangToggle className="bg-white/10 border border-white/20 text-white" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-xl hover:bg-white/15 text-white transition-all"
            title={t("logout")}
            aria-label={t("logout")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 py-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(48,109,41,0.25)] border-0 !p-4"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
              {t("total_stock_items")}
            </div>
            <div className="text-3xl font-extrabold text-white leading-none">{totalItems}</div>
          </div>

          <div
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(30,77,25,0.2)] border-0 !p-4"
            style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
          >
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
              {t("plant_categories")}
            </div>
            <div className="text-3xl font-extrabold text-white leading-none">{categories.length}</div>
          </div>
        </div>

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
              className="w-12 h-12 flex items-center justify-center btn-premium-primary rounded-xl flex-shrink-0 cursor-pointer shadow-premium-sm text-white"
              title={t("add_new_category")}
            >
              <Plus size={22} />
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
                          setDeleteId(cat._id);
                        }}
                        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 border border-neutral-200 text-danger flex items-center justify-center shadow-premium-sm hover:bg-red-50"
                        title={t("delete")}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => router.push(`/stock?category=${cat._id}`)}
                        className="text-left flex flex-col flex-grow"
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
          )}
        </div>

        <AddCategoryModal
          open={showAddCat}
          onClose={() => setShowAddCat(false)}
          onAdded={fetchCategories}
        />

        <ConfirmDialog
          open={!!deleteId}
          title={t("delete_category")}
          message={t("delete_category_msg")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/LanguageContext";
import { Plus } from "lucide-react";
import LangToggle from "@/components/ui/LangToggle";
import { useRouter } from "next/navigation";

interface Sale {
  _id: string;
  bill_number: string;
  customer_name: string;
  final_amount: number;
  payment_method: string;
  created_at: string;
  items: any[];
  with_gst?: boolean;
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_GU = [
  "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
  "જુલાઈ", "ઓગસ્ટ", "સપ્ટેમ્બર", "ઓક્ટોબર", "નવેમ્બર", "ડિસેમ્બર",
];

export default function SalesPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<string>(""); // 1-12 or ""
  const [filterYear, setFilterYear] = useState<string>(String(now.getFullYear()));

  async function loadSales() {
    setLoading(true);
    const res = await fetch("/api/sales");
    const data = await res.json();
    setSales(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  const years = useMemo(() => {
    const set = new Set<number>([now.getFullYear()]);
    sales.forEach((s) => {
      if (s.created_at) set.add(new Date(s.created_at).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const d = new Date(s.created_at);
      if (filterYear && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth && d.getMonth() + 1 !== Number(filterMonth)) return false;
      return true;
    });
  }, [sales, filterMonth, filterYear]);

  const todayTotal = filteredSales
    .filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.final_amount, 0);

  const periodTotal = filteredSales.reduce((a, b) => a + b.final_amount, 0);
  const months = lang === "gu" ? MONTHS_GU : MONTHS_EN;

  return (
    <div className="flex-grow pb-24">
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <h1 className="text-lg font-bold text-white">{t("sales")}</h1>
        <LangToggle className="bg-white/10 border border-white/20 text-white" />
      </div>

      <div className="px-5 py-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div
            className="premium-card relative overflow-hidden text-white border-0 !p-4"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
              {t("today")}
            </div>
            <div className="text-2xl font-extrabold text-white">₹{todayTotal}</div>
          </div>
          <div
            className="premium-card relative overflow-hidden text-white border-0 !p-4"
            style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
          >
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
              {t("this_month")}
            </div>
            <div className="text-2xl font-extrabold text-white">₹{periodTotal}</div>
          </div>
        </div>

        {/* Month / Year filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="premium-label">{t("filter_month")}</label>
            <select
              className="premium-input appearance-none"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">{t("filter_all")}</option>
              {months.map((m, i) => (
                <option key={m} value={String(i + 1)}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="premium-label">{t("filter_year")}</label>
            <select
              className="premium-input appearance-none"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">{t("filter_all")}</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900">{t("recent_transactions")}</h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-neutral-200 animate-pulse rounded-2xl shadow-premium-sm" />
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
              <span className="text-4xl mb-3">🧾</span>
              <h3 className="text-base font-bold text-neutral-900">{t("no_sales")}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredSales.map((sale) => (
                <div
                  key={sale._id}
                  className="premium-card flex justify-between items-center active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary text-lg flex-shrink-0">
                      💰
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 truncate">{sale.bill_number}</div>
                      <div className="text-xs text-neutral-600 mt-0.5 truncate">
                        {sale.customer_name || t("walk_in")}
                        {" · "}
                        {new Date(sale.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-neutral-900 text-base">₹{sale.final_amount}</div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-50 text-neutral-600 border border-neutral-200 mt-1">
                      {t(sale.payment_method as any) || sale.payment_method}
                      {sale.with_gst ? " · GST" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => router.push("/sales/new")}
        className="premium-fab"
        aria-label={t("new_sale")}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

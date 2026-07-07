"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/LanguageContext";
import { Plus } from "lucide-react";

interface Sale {
  _id: string;
  bill_number: string;
  customer_name: string;
  final_amount: number;
  payment_method: string;
  created_at: string;
  items: any[];
}

export default function SalesPage() {
  const { t, lang } = useLang();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSales() {
    setLoading(true);
    const res = await fetch("/api/sales");
    setSales(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  const todayTotal = sales
    .filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.final_amount, 0);

  return (
    <div className="flex-grow pb-24">
      {/* Premium #306D29 Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
        <h1 className="text-lg font-bold text-white">{t("sales") || "Sales Ledger"}</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => (window.location.href = "/sales/new")}
            className="btn-premium-primary !h-10 text-xs py-2 px-4 !bg-white/10 !text-white hover:!bg-white/20 border border-white/25 shadow-none"
          >
            <Plus size={16} /> New Sale
          </button>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Sales Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div 
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(48,109,41,0.25)] border-0"
            style={{ background: "linear-gradient(135deg, #306D29, #4CAF50)" }}
          >
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Today's Sales</div>
            <div className="text-3xl font-extrabold text-white">₹{todayTotal}</div>
            <div className="text-xs text-white/70 font-semibold mt-2">Recorded transactions today</div>
          </div>
          <div 
            className="premium-card relative overflow-hidden text-white shadow-[0_10px_25px_rgba(30,77,25,0.2)] border-0"
            style={{ background: "linear-gradient(135deg, #1E4D19, #306D29)" }}
          >
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">This Month</div>
            <div className="text-3xl font-extrabold text-white">₹{sales.reduce((a, b) => a + b.final_amount, 0)}</div>
            <div className="text-xs text-white/70 font-semibold mt-2">Cumulative monthly volume</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Recent Transactions</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 bg-neutral-200 animate-pulse rounded-2xl shadow-premium-sm" />)}
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-neutral-200 shadow-premium-sm flex flex-col items-center">
              <span className="text-4xl mb-3">🧾</span>
              <h3 className="text-base font-bold text-neutral-900">No sales recorded</h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-xs">No orders or counter sales have been finalized yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sales.map((sale) => (
                <div 
                  key={sale._id} 
                  className="premium-card flex justify-between items-center active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary text-lg">
                      💰
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{sale.bill_number}</div>
                      <div className="text-xs text-neutral-600 mt-0.5">{sale.customer_name || "Walk-in Customer"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 text-base">₹{sale.final_amount}</div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-50 text-neutral-600 border border-neutral-200 mt-1">
                      {sale.payment_method}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => (window.location.href = "/sales/new")}
        className="premium-fab"
        aria-label="New Sale"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

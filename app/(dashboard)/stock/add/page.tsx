"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import StockForm from "@/components/stock/StockForm";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";

function AddStockContent() {
  const router = useRouter();
  const { t } = useLang();

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t("save"));
        const cat = data.category_id;
        router.push(cat ? `/stock?category=${cat}` : "/stock");
      } else {
        toast.error("Failed to add stock");
      }
    } catch {
      toast.error("Error saving stock");
    }
  };

  return (
    <div className="flex-grow pb-12">
      <PageHeader title={t("add_stock")} showBack />
      <div className="p-5">
        <StockForm onSubmit={handleSubmit} submitLabel={t("save")} />
      </div>
    </div>
  );
}

export default function AddStockPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <AddStockContent />
    </Suspense>
  );
}

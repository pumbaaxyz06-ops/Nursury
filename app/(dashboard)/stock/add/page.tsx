"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import StockForm from "@/components/stock/StockForm";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";

export default function AddStockPage() {
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
        toast.success("Stock added successfully");
        router.push("/stock");
      } else {
        toast.error("Failed to add stock");
      }
    } catch (e) {
      toast.error("Error saving stock");
    }
  };

  return (
    <div className="flex-grow pb-12">
      <PageHeader title="Add Stock" showBack />
      <div className="p-5">
        <StockForm onSubmit={handleSubmit} submitLabel="Save Stock" />
      </div>
    </div>
  );
}

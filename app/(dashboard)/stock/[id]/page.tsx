"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import StockForm from "@/components/stock/StockForm";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";

export default function EditStockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLang();
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, [id]);

  async function fetchStock() {
    const res = await fetch(`/api/stock/${id}`);
    const data = await res.json();
    setInitial(data);
    setLoading(false);
  }

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/stock/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Stock updated");
      router.push("/stock");
    } else {
      toast.error("Update failed");
    }
  };

  if (loading || !initial) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex-grow pb-12">
      <PageHeader title="Edit Stock" showBack />
      <div className="p-5">
        <StockForm initial={initial} onSubmit={handleSubmit} submitLabel={t("save")} />
      </div>
    </div>
  );
}

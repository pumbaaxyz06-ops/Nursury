"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import StockForm from "@/components/stock/StockForm";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function StockDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLang();
  const [initial, setInitial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
      toast.success(t("save"));
      const updated = await res.json();
      setInitial(updated);
      setEditing(false);
    } else {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/stock/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("delete"));
      router.push("/stock");
    } else {
      toast.error("Delete failed");
    }
    setShowDelete(false);
  };

  if (loading || !initial) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="flex-grow pb-12">
      <PageHeader
        title={editing ? t("stock_edit") : t("stock_view")}
        showBack
        rightAction={
          !editing ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold hover:bg-white/25"
              >
                <Pencil size={14} />
                {t("edit")}
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="p-2 rounded-xl hover:bg-white/15 text-white"
                title={t("delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold"
            >
              {t("cancel")}
            </button>
          )
        }
      />
      <div className="p-5">
        <StockForm
          key={`${id}-${editing}`}
          initial={initial}
          onSubmit={handleSubmit}
          submitLabel={t("save")}
          readOnly={!editing}
        />
      </div>

      <ConfirmDialog
        open={showDelete}
        title={t("delete_stock")}
        message={t("delete_stock_msg")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

export default function EditStockPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <StockDetailContent />
    </Suspense>
  );
}

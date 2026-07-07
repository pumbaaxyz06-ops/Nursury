"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import SaleForm from "@/components/sales/SaleForm";
import { generateBill } from "@/lib/generateBill";
import { useSession } from "next-auth/react";
import { useLang } from "@/lib/LanguageContext";

export default function NewSalePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLang();

  const handleComplete = (sale: any) => {
    const nursery = (session?.user as any)?.nursery_name || "Nursery";
    generateBill(sale, nursery);
    router.push("/sales");
  };

  return (
    <div>
      <PageHeader title={t("new_sale")} showBack />
      <SaleForm onComplete={handleComplete} />
    </div>
  );
}

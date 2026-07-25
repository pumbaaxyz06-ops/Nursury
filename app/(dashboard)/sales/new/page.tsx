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
    const user = session?.user as any;
    generateBill(sale, {
      nurseryName: user?.nursery_name || "Nursery",
      ownerName: user?.name || "",
      phone: user?.phone || "",
    });
    router.push("/sales");
  };

  return (
    <div className="pb-8">
      <PageHeader title={t("new_sale")} showBack />
      <SaleForm onComplete={handleComplete} />
    </div>
  );
}

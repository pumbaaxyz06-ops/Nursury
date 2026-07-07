"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import BookingForm from "@/components/bookings/BookingForm";
import { useLang } from "@/lib/LanguageContext";

export default function NewBookingPage() {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div>
      <PageHeader title={t("new_booking")} showBack />
      <BookingForm onSaved={() => router.push("/bookings")} />
    </div>
  );
}

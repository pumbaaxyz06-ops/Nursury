"use client";

import { useLang } from "@/lib/LanguageContext";
import { interpolate } from "@/lib/i18n";

export default function AppFooter({ className = "" }: { className?: string }) {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const platform = t("app_name") || "Vriksh";

  return (
    <footer
      className={`w-full text-center py-4 px-4 text-[11px] font-medium text-neutral-500 border-t border-neutral-100 bg-white/80 ${className}`}
    >
      {interpolate(t("copyright"), { year, name: platform })}
    </footer>
  );
}

"use client";

import { useLang } from "@/lib/LanguageContext";

export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const hasBg = className.includes("bg-");
  const hasBorder = className.includes("border");

  return (
    <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-full transition-all ${
      hasBg ? "" : "bg-neutral-100"
    } ${
      hasBorder ? "" : "border border-neutral-200"
    } shadow-premium-sm ${className}`}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
          lang === "en" ? "bg-[#306D29] text-white shadow-premium-sm" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("gu")}
        className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
          lang === "gu" ? "bg-[#306D29] text-white shadow-premium-sm" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        ગુ
      </button>
    </div>
  );
}

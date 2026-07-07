"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LangToggle from "./LangToggle";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-[#306D29] border-b border-[#255420] shadow-premium-sm">
      <div className="flex items-center gap-2 text-white">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/10 active:scale-95 rounded-xl transition-all text-white/90 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="page-title text-base font-bold text-white tracking-tight">{title}</h1>
      </div>
      {rightAction ? (
        <div className="text-white">{rightAction}</div>
      ) : (
        <LangToggle className="bg-white/10 border border-white/20 text-white" />
      )}
    </div>
  );
}

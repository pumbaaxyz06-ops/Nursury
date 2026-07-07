"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, t as translate } from "./i18n";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Parameters<typeof translate>[0]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("gu");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "gu" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: Parameters<typeof translate>[0]) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback when not wrapped - use Gujarati
    return {
      lang: "gu" as Lang,
      setLang: () => {},
      t: (key: Parameters<typeof translate>[0]) => translate(key, "gu"),
    };
  }
  return context;
}

"use client";

import { useState } from "react";
import { useLang } from "@/lib/LanguageContext";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCategoryModal({ open, onClose, onAdded }: AddCategoryModalProps) {
  const { t, lang } = useLang();
  const [nameGu, setNameGu] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [emoji, setEmoji] = useState("🌱");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameGu || !nameEn) return;

    setLoading(true);
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameGu: nameGu.trim(),
          nameEn: nameEn.trim(),
          emoji: emoji.trim(),
          image: "",
        }),
      });
      onAdded();
      onClose();
      // reset
      setNameGu("");
      setNameEn("");
      setEmoji("🌱");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-900)' }}>
          {t("add_new_category")}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Gujarati Name *</label>
            <input
              className="input"
              value={nameGu}
              onChange={(e) => setNameGu(e.target.value)}
              placeholder="ટામેટા"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">English Name *</label>
            <input
              className="input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Tomato"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Emoji</label>
            <input
              className="input"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🍅"
              maxLength={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || !nameGu || !nameEn}
            >
              {loading ? "Saving..." : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

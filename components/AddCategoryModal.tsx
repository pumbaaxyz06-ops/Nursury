"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/LanguageContext";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const EMOJI_OPTIONS = ["🌱", "🍅", "🌶️", "🥬", "🍆", "🌼", "🌹", "🥭", "🧅", "🥔", "🌿", "🌲"];

export default function AddCategoryModal({ open, onClose, onAdded }: AddCategoryModalProps) {
  const { t } = useLang();
  const [nameGu, setNameGu] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [emoji, setEmoji] = useState("🌱");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setNameGu("");
    setNameEn("");
    setEmoji("🌱");
    setImage("");
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImage((ev.target?.result as string) || "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameGu || !nameEn) return;

    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameGu: nameGu.trim(),
          nameEn: nameEn.trim(),
          emoji: emoji.trim() || "🌱",
          image: image || "https://via.placeholder.com/300x200?text=Plant",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("save"));
      onAdded();
      reset();
      onClose();
    } catch {
      toast.error("Could not save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-[2px]">
      <div
        className="bg-white w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-3xl shadow-premium-float max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#306D29] text-white sm:rounded-t-2xl">
          <h3 className="text-base font-bold tracking-tight">{t("add_new_category")}</h3>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-white/15 transition-colors"
            aria-label={t("cancel")}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Image upload */}
          <div>
            <label className="premium-label">{t("category_image")}</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-primary/30 bg-primary-light/30 hover:bg-primary-light/50 rounded-2xl min-h-[140px] flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImage(e.target.files?.[0])}
              />
              {image ? (
                <div className="relative w-full h-36">
                  <img src={image} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-2">
                    <span className="text-xs font-bold text-white bg-black/40 px-3 py-1 rounded-full">
                      {t("upload_photo")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2 px-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white shadow-premium-sm flex items-center justify-center text-primary">
                    <ImagePlus size={22} />
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{t("upload_photo")}</div>
                  <div className="text-[11px] text-neutral-600">PNG, JPG · tap to select</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="premium-label">{t("name_gu")} *</label>
            <input
              className="premium-input"
              value={nameGu}
              onChange={(e) => setNameGu(e.target.value)}
              placeholder="ટામેટા"
              required
            />
          </div>

          <div>
            <label className="premium-label">{t("name_en")} *</label>
            <input
              className="premium-input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Tomato"
              required
            />
          </div>

          <div>
            <label className="premium-label">Icon / Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-11 h-11 text-xl rounded-xl border-2 transition-all ${
                    emoji === e
                      ? "border-primary bg-primary-light shadow-premium-sm scale-105"
                      : "border-neutral-200 bg-white hover:border-primary/40"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="btn-premium-secondary flex-1"
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="btn-premium-primary flex-1"
              disabled={loading || !nameGu || !nameEn}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {t("saving")}
                </span>
              ) : (
                t("save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

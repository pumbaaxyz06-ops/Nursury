"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/LanguageContext";
import LangToggle from "@/components/ui/LangToggle";
import AppFooter from "@/components/ui/AppFooter";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [nurseryName, setNurseryName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLang();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nurseryName || !phone || !password) return;

    if (password !== confirmPassword) {
      toast.error(t("password_mismatch"));
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nursery_name: nurseryName.trim(),
          phone: phone.trim().replace(/\s+/g, ""),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(t("register_success"));
        router.push("/login");
      } else if (data.error === "phone_exists") {
        toast.error(t("phone_exists"));
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-10 bg-gradient-to-b from-[#F8FFF8] via-[#F4FAF6] to-[#F1F8F4] relative overflow-hidden">
      <div className="absolute -top-12 -left-12 text-7xl opacity-10 pointer-events-none select-none">🍃</div>
      <div className="absolute -bottom-12 -right-12 text-7xl opacity-10 pointer-events-none select-none">🌿</div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-neutral-200/60 shadow-premium-lg p-8 space-y-6 relative z-10">
        <div className="flex justify-end">
          <LangToggle />
        </div>

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center text-3xl shadow-premium-sm">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mt-2">
            {t("register_title")}
          </h1>
          <p className="text-sm font-medium text-neutral-600">{t("register_subtitle")}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="premium-label">{t("owner_name")} *</label>
            <input
              className="premium-input"
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="premium-label">{t("nursery_name")} *</label>
            <input
              className="premium-input"
              placeholder="e.g. Green Leaf Nursery"
              value={nurseryName}
              onChange={(e) => setNurseryName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="premium-label">📱 {t("phone")} *</label>
            <input
              type="tel"
              inputMode="numeric"
              className="premium-input"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="premium-label">🔐 {t("password")} *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="premium-input !pr-12"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-primary rounded-lg"
                aria-label={showPassword ? t("hide_password") : t("show_password")}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="premium-label">🔐 {t("confirm_password")} *</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="premium-input !pr-12"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-primary rounded-lg"
                aria-label={showConfirm ? t("hide_password") : t("show_password")}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !nurseryName || !phone || !password}
            className="btn-premium-primary w-full mt-2 disabled:opacity-60"
          >
            {loading ? t("registering") : `🌿 ${t("create_account")}`}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600">
          {t("already_have_account")}{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>

      <div className="mt-6 w-full max-w-[420px]">
        <AppFooter className="bg-transparent border-0" />
      </div>
    </div>
  );
}

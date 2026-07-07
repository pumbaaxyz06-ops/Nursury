"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";
import LangToggle from "@/components/ui/LangToggle";
import { toast } from "sonner";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLang();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    setLoading(true);
    const res = await signIn("credentials", {
      phone: phone.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      toast.success(t("login_success"));
      router.replace("/home");
    } else {
      toast.error(t("invalid_credentials"));
    }
  };

  const createDemoUser = async () => {
    setLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      setPhone("9876543210");
      setPassword("123456");
      toast.success("Demo data seeded! Phone: 9876543210 | Password: 123456");
    } catch (e) {
      toast.error("Could not create demo user");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-gradient-to-b from-[#F8FFF8] via-[#F4FAF6] to-[#F1F8F4] relative overflow-hidden">
      {/* Absolute Decorative Leaves */}
      <div className="absolute -top-12 -left-12 text-7xl opacity-10 pointer-events-none select-none">🍃</div>
      <div className="absolute -bottom-12 -right-12 text-7xl opacity-10 pointer-events-none select-none">🌿</div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-neutral-200/60 shadow-premium-lg p-8 space-y-8 relative z-10">
        <div className="flex justify-end">
          <LangToggle />
        </div>

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center text-3xl shadow-premium-sm">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mt-2">
            {t("app_name") || "Vriksh"}
          </h1>
          <p className="text-sm font-semibold text-primary/80">નર્સરી મેનેજમેન્ટ પોર્ટલ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="premium-label">
              📱 {t("phone") || "Phone Number"}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              className="premium-input"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="premium-label">
              🔐 {t("password") || "Password"}
            </label>
            <input
              type="password"
              className="premium-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="btn-premium-primary w-full mt-2 disabled:opacity-60"
          >
            {loading ? "Logging in..." : `🌿 ${t("login") || "Login"}`}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 bg-primary-light/50 border border-primary/20 rounded-2xl space-y-2.5">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Farmer Demo Account</span>
          </div>
          <div className="text-center space-y-1 text-xs text-neutral-900">
            <div><span className="font-semibold text-neutral-600">Phone:</span> <span className="font-mono font-bold">9876543210</span></div>
            <div><span className="font-semibold text-neutral-600">Password:</span> <span className="font-mono font-bold">123456</span></div>
          </div>
        </div>

        <button
          onClick={createDemoUser}
          disabled={loading}
          className="w-full text-center text-xs py-3.5 border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary-light active:scale-[0.985] transition-all bg-white"
        >
          🌱 Seed Full Demo Data & Autofill
        </button>
      </div>

      <div className="mt-8 text-center text-[10px] text-neutral-600 max-w-[280px]">
        Designed for Gujarat Farmers • Big Touch Targets • Gujarati First UI
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/LanguageContext";
import { toast } from "sonner";
import { User, Building2, Phone, ShieldCheck, Calendar, Lock, Globe, Save, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { t, lang, setLang } = useLang();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [nurseryName, setNurseryName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<"en" | "gu">("gu");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setNurseryName(data.nursery_name || "");
        setPhone(data.phone || "");
        setLanguage(data.language || "gu");
        setRole(data.role || "farmer");
        if (data.created_at) {
          setCreatedAt(new Date(data.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }));
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !nurseryName || !phone) {
      toast.error("Name, Nursery Name, and Phone are required");
      return;
    }

    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nursery_name: nurseryName,
          phone,
          language,
          new_password: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile details updated successfully!");
        setNewPassword("");
        // Update language state if changed
        if (language !== lang) {
          setLang(language);
        }
        // Refresh NextAuth session client state
        if (updateSession) {
          await updateSession({
            name: data.user.name,
            nursery_name: data.user.nursery_name,
            phone: data.user.phone,
          });
        }
      } else {
        if (data.error === "phone_exists") {
          toast.error("This phone number is already registered with another account");
        } else {
          toast.error(data.error || "Failed to update profile");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "NR";

  return (
    <div className="pb-6">
      <PageHeader title="My Profile" showBack />

      <div className="p-5 max-w-2xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-44 rounded-3xl bg-neutral-200 animate-pulse shadow-premium-sm" />
            <div className="h-64 rounded-3xl bg-neutral-200 animate-pulse shadow-premium-sm" />
          </div>
        ) : (
          <>
            {/* Header Hero Card */}
            <div className="premium-card relative overflow-hidden text-white border-0 !p-6 bg-gradient-to-br from-[#306D29] via-[#3B8033] to-[#4CAF50] shadow-premium-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center font-extrabold text-2xl text-white shadow-premium-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white truncate">{name}</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <ShieldCheck size={12} /> {role}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-100 mt-0.5 truncate flex items-center gap-1.5">
                    <Building2 size={15} className="flex-shrink-0" />
                    <span>{nurseryName}</span>
                  </div>
                  {createdAt && (
                    <div className="text-xs text-white/80 mt-2 flex items-center gap-1">
                      <Calendar size={13} />
                      <span>Registered since {createdAt}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Edit Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-200/80 shadow-premium-md p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <User size={18} className="text-primary" /> Edit Registration Information
                </h3>
                <span className="text-xs text-neutral-500 font-medium">Update account profile</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="premium-label flex items-center gap-1.5">
                    <User size={14} className="text-primary" /> Owner / Manager Name *
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Enter owner full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="premium-label flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary" /> Nursery Name *
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Enter official nursery name"
                    value={nurseryName}
                    onChange={(e) => setNurseryName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="premium-label flex items-center gap-1.5">
                    <Phone size={14} className="text-primary" /> Phone Number *
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="10 digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="premium-label flex items-center gap-1.5">
                    <Globe size={14} className="text-primary" /> Preferred Interface Language
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLanguage("gu")}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        language === "gu"
                          ? "bg-gradient-to-r from-[#306D29] to-[#4CAF50] text-white border-transparent shadow-premium-sm"
                          : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      ગુજરાતી (Gujarati)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        language === "en"
                          ? "bg-gradient-to-r from-[#306D29] to-[#4CAF50] text-white border-transparent shadow-premium-sm"
                          : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <label className="premium-label flex items-center gap-1.5">
                    <Lock size={14} className="text-primary" /> Change Password ({t("optional")})
                  </label>
                  <input
                    type="password"
                    className="premium-input"
                    placeholder="Leave blank to keep existing password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">Minimum 6 characters if you wish to change your password.</p>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-premium-primary w-full cursor-pointer disabled:opacity-60 gap-2"
                >
                  {saving ? (
                    <span>Saving Updates...</span>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

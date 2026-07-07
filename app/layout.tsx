import type { Metadata, Viewport } from "next";
import { Noto_Sans_Gujarati, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/LanguageContext";
import SessionProvider from "@/components/SessionProvider";

const notoGujarati = Noto_Sans_Gujarati({
  variable: "--font-gujarati",
  subsets: ["gujarati", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vriksh | વૃક્ષ",
  description: "Simple mobile-first nursery stock & sales manager for farmers",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#166534",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="gu"
      className={`${notoGujarati.variable} ${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-b from-[#F8FFF8] to-[#F5FBF7] font-sans antialiased">
        <SessionProvider>
          <LanguageProvider>
            {/* Premium Centered Standalone App Container */}
            <div className="w-full max-w-[480px] mx-auto min-h-screen bg-white shadow-premium-lg border-x border-neutral-200/50 relative flex flex-col pb-16">
              {children}
            </div>
          </LanguageProvider>
        </SessionProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

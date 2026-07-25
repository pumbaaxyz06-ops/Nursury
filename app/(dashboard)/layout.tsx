import BottomNav from "@/components/ui/BottomNav";
import AppFooter from "@/components/ui/AppFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col min-h-screen relative">
      <div className="flex-grow flex flex-col">{children}</div>
      <AppFooter className="pb-20 pt-6 mt-auto" />
      <BottomNav />
    </div>
  );
}

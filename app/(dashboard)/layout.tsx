import BottomNav from "@/components/ui/BottomNav";
import AppFooter from "@/components/ui/AppFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col min-h-screen relative">
      <div className="flex-grow flex flex-col pb-4">{children}</div>
      <AppFooter className="mb-16" />
      <BottomNav />
    </div>
  );
}

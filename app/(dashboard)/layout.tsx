import BottomNav from "@/components/ui/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col min-h-screen relative">
      {children}
      <BottomNav />
    </div>
  );
}

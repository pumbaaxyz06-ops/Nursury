import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import StockItem from "@/models/StockItem";
import PlantCategory from "@/models/PlantCategory";
import Sale from "@/models/Sale";
import AdvanceBooking from "@/models/AdvanceBooking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;

  // 1. Stock items & value
  const stockItems = await StockItem.find({ is_active: true }).lean();
  const totalStockQuantity = stockItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalStockValue = stockItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price_per_unit) || 0),
    0
  );

  // 2. Categories
  const categoriesCount = await PlantCategory.countDocuments();

  // 3. Sales statistics (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const salesQuery = { farmer_id: userId };
  const allSales = await Sale.find(salesQuery).sort({ created_at: -1 }).lean();
  
  const monthlySales = allSales.filter((s: any) => new Date(s.created_at) >= startOfMonth);
  const monthlySalesRevenue = monthlySales.reduce((sum, s) => sum + (Number(s.final_amount) || 0), 0);

  // 4. Bookings statistics
  const activeBookings = await AdvanceBooking.find({
    farmer_id: userId,
    status: { $in: ["pending", "ready_to_dispatch"] },
  }).sort({ createdAt: -1 }).lean();

  const pendingBookingsCount = activeBookings.length;
  const totalBalanceDue = activeBookings.reduce((sum, b) => sum + (Number(b.balance_due) || 0), 0);

  // 5. Recent dispatches / fulfilled
  const recentBookings = await AdvanceBooking.find({ farmer_id: userId })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  // 6. Low stock items (< 20)
  const lowStockItems = stockItems.filter((i) => Number(i.quantity) < 20);

  return NextResponse.json({
    totalStockQuantity,
    totalStockValue: Math.round(totalStockValue),
    categoriesCount,
    monthlySalesRevenue: Math.round(monthlySalesRevenue),
    totalSalesCount: allSales.length,
    pendingBookingsCount,
    totalBalanceDue: Math.round(totalBalanceDue),
    recentSales: allSales.slice(0, 4),
    recentBookings,
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.slice(0, 4),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Sale from "@/models/Sale";
import StockItem from "@/models/StockItem";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const query: any = {};
  if (from || to) {
    query.created_at = {};
    if (from) query.created_at.$gte = new Date(from);
    if (to) query.created_at.$lte = new Date(to);
  }

  const sales = await Sale.find(query).sort({ created_at: -1 }).lean();
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const userId = (session.user as any).id;

  // Deduct stock
  for (const item of body.items) {
    const stock = await StockItem.findById(item.stock_item_id);
    if (stock) {
      stock.quantity = Math.max(0, stock.quantity - item.quantity);
      await stock.save();
    }
  }

  const sale = await Sale.create({
    ...body,
    farmer_id: userId,
  });

  return NextResponse.json(sale);
}

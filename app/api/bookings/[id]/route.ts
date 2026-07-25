import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AdvanceBooking from "@/models/AdvanceBooking";
import StockItem from "@/models/StockItem";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const booking = await AdvanceBooking.findById(id).lean();
  return NextResponse.json(booking);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const body = await req.json();

  const booking = await AdvanceBooking.findById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previousStatus = booking.status;

  Object.assign(booking, body);

  // When fulfilled: deduct stock + flag
  if (body.status === "fulfilled" && previousStatus !== "fulfilled") {
    for (const item of booking.items) {
      const stock = await StockItem.findById(item.stock_item_id);
      if (stock) {
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
        await stock.save();
      }
    }
    booking.fulfilled_date = new Date();
    booking.notification_sent = true;
  }

  await booking.save();

  return NextResponse.json(booking);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await AdvanceBooking.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import StockItem from "@/models/StockItem";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const item = await StockItem.findById(id).populate("category_id", "name emoji").lean();
  return NextResponse.json(item);
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

  if (body.price_per_unit !== undefined) {
    body.price_per_unit = parseFloat(String(body.price_per_unit));
  }
  if (body.quantity !== undefined) {
    body.quantity = parseFloat(String(body.quantity));
  }

  const updated = await StockItem.findByIdAndUpdate(id, body, { new: true }).populate("category_id", "name emoji");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await StockItem.findByIdAndUpdate(id, { is_active: false });
  return NextResponse.json({ success: true });
}

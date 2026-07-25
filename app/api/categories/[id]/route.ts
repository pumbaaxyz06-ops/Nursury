import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PlantCategory from "@/models/PlantCategory";
import StockItem from "@/models/StockItem";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  await PlantCategory.findByIdAndUpdate(id, { is_active: false });
  await StockItem.updateMany({ category_id: id }, { is_active: false });

  return NextResponse.json({ success: true });
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

  const update: any = {};
  if (body.nameGu || body.nameEn) {
    update.name = {
      gu: body.nameGu,
      en: body.nameEn,
    };
  }
  if (body.emoji !== undefined) update.emoji = body.emoji;
  if (body.image !== undefined) update.image = body.image;

  const cat = await PlantCategory.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json(cat);
}

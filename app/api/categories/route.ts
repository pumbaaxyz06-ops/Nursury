import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PlantCategory from "@/models/PlantCategory";
import StockItem from "@/models/StockItem";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const categories = await PlantCategory.find({ is_active: true })
    .sort({ sort_order: 1 })
    .lean();

  // Attach live stock count to each category
  const results = await Promise.all(
    categories.map(async (cat) => {
      const totalQty = await StockItem.aggregate([
        { $match: { category_id: cat._id, is_active: true } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]);

      return {
        ...cat,
        totalQuantity: totalQty[0]?.total || 0,
      };
    })
  );

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { nameGu, nameEn, emoji, image } = body;

  if (!nameGu || !nameEn) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const cat = await PlantCategory.create({
    name: { gu: nameGu, en: nameEn },
    emoji: emoji || "🌱",
    image: image || "https://via.placeholder.com/300x200?text=Plant",
    created_by: userId,
  });

  return NextResponse.json(cat);
}

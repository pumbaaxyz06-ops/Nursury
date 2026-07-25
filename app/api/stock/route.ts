import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import StockItem from "@/models/StockItem";
import "@/models/PlantCategory"; // ensure schema is registered for populate

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const condition = searchParams.get("condition");
  const search = searchParams.get("search") || "";
  const lowStock = searchParams.get("lowStock") === "true";

  const query: any = { is_active: true };

  if (category) query.category_id = category;
  if (condition) query.condition = condition;

  let items = await StockItem.find(query)
    .populate("category_id", "name emoji")
    .sort({ createdAt: -1 })
    .lean();

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      (i: any) =>
        i.name?.gu?.toLowerCase().includes(s) ||
        i.name?.en?.toLowerCase().includes(s)
    );
  }

  if (lowStock) {
    items = items.filter((i: any) => i.quantity < 20);
  }

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const userId = (session.user as any).id;

  const price_per_unit = body.price_per_unit !== undefined ? parseFloat(String(body.price_per_unit)) : 0;
  const quantity = body.quantity !== undefined ? parseFloat(String(body.quantity)) : 0;

  const item = await StockItem.create({
    ...body,
    price_per_unit,
    quantity,
    image: body.image || "https://picsum.photos/id/106/300/200",
    condition_image: body.condition_image || "",
    registered_by: userId,
  });

  return NextResponse.json(item);
}

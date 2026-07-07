import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AdvanceBooking from "@/models/AdvanceBooking";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query: any = {};
  if (status) query.status = status;

  const bookings = await AdvanceBooking.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const userId = (session.user as any).id;

  const booking = await AdvanceBooking.create({
    ...body,
    farmer_id: userId,
  });

  return NextResponse.json(booking);
}

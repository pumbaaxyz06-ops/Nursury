import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { captureError } from "@/lib/sentry";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e: any) {
    console.error("GET Profile error:", e);
    captureError(e, { tags: { area: "profile", action: "get" } });
    return NextResponse.json({ error: e?.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const nursery_name = String(body.nursery_name || "").trim();
    const phone = String(body.phone || "").trim().replace(/\s+/g, "");
    const language = body.language === "en" ? "en" : "gu";
    const new_password = String(body.new_password || "");

    if (!name || !nursery_name || !phone) {
      return NextResponse.json({ error: "Name, Nursery name and phone are required" }, { status: 400 });
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    }

    if (phone !== user.phone) {
      const existing = await User.findOne({ phone, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json({ error: "phone_exists" }, { status: 409 });
      }
    }

    user.name = name;
    user.nursery_name = nursery_name;
    user.phone = phone;
    user.language = language;

    if (new_password) {
      if (new_password.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }
      user.password = await bcrypt.hash(new_password, 10);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        nursery_name: user.nursery_name,
        role: user.role,
        language: user.language,
        created_at: user.created_at,
      },
    });
  } catch (e: any) {
    console.error("PUT Profile error:", e);
    captureError(e, { tags: { area: "profile", action: "put" } });
    return NextResponse.json({ error: e?.message || "Failed to update profile" }, { status: 500 });
  }
}

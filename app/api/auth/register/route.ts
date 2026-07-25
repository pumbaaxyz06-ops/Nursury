import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { captureError } from "@/lib/sentry";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim().replace(/\s+/g, "");
    const password = String(body.password || "");
    const nursery_name = String(body.nursery_name || "").trim();

    if (!name || !phone || !password || !nursery_name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return NextResponse.json({ error: "phone_exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      password: hashed,
      nursery_name,
      role: "farmer",
      language: "gu",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        nursery_name: user.nursery_name,
      },
    });
  } catch (e: any) {
    console.error("Register error:", e);
    captureError(e, { tags: { area: "auth", action: "register" } });
    return NextResponse.json({ error: e?.message || "Registration failed" }, { status: 500 });
  }
}

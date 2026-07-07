import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PlantCategory from "@/models/PlantCategory";
import StockItem from "@/models/StockItem";

// POST /api/seed  -> seeds full demo data for farmer testing
export async function POST() {
  await connectDB();

  const DEMO_PHONE = "9876543210";
  const DEMO_PASSWORD = "123456";

  // Create or update demo user
  let user = await User.findOne({ phone: DEMO_PHONE });
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  if (!user) {
    user = await User.create({
      name: "Ramesh Patel",
      phone: DEMO_PHONE,
      password: hashed,
      nursery_name: "Green Leaf Nursery",
      role: "farmer",
      language: "gu",
    });
  } else {
    user.password = hashed;
    user.nursery_name = "Green Leaf Nursery";
    await user.save();
  }

  // Seed Categories
  const categoryData = [
    { name: { en: "Tomato", gu: "ટમેટા" }, emoji: "🍅" },
    { name: { en: "Chilli", gu: "મરચું" }, emoji: "🌶️" },
    { name: { en: "Cabbage", gu: "કોબી" }, emoji: "🥬" },
    { name: { en: "Brinjal", gu: "રીંગણ" }, emoji: "🍆" },
    { name: { en: "Marigold", gu: "મરીગોલ્ડ" }, emoji: "🌼" },
    { name: { en: "Rose", gu: "ગુલાબ" }, emoji: "🌹" },
  ];

  const categories: any[] = [];
  for (const data of categoryData) {
    let cat = await PlantCategory.findOne({
      "name.en": data.name.en,
      created_by: user._id,
    });
    if (!cat) {
      cat = await PlantCategory.create({
        name: data.name,
        emoji: data.emoji,
        image: "https://picsum.photos/id/1018/300/200",
        created_by: user._id,
        is_active: true,
      });
    }
    categories.push(cat);
  }

  // Seed Stock
  const stockData = [
    { categoryIndex: 0, name: { en: "Hybrid Tomato", gu: "હાઇબ્રિડ ટમેટા" }, quantity: 450, unit: "piece", price_per_unit: 6, condition: "healthy" },
    { categoryIndex: 0, name: { en: "Desi Tomato", gu: "દેશી ટમેટા" }, quantity: 120, unit: "piece", price_per_unit: 4, condition: "average" },
    { categoryIndex: 1, name: { en: "Green Chilli", gu: "લીલું મરચું" }, quantity: 380, unit: "piece", price_per_unit: 8, condition: "healthy" },
    { categoryIndex: 1, name: { en: "Red Chilli", gu: "લાલ મરચું" }, quantity: 95, unit: "kg", price_per_unit: 95, condition: "healthy" },
    { categoryIndex: 2, name: { en: "Fresh Cabbage", gu: "તાજી કોબી" }, quantity: 85, unit: "piece", price_per_unit: 25, condition: "healthy" },
    { categoryIndex: 3, name: { en: "Long Brinjal", gu: "લાંબા રીંગણ" }, quantity: 210, unit: "piece", price_per_unit: 12, condition: "healthy" },
    { categoryIndex: 4, name: { en: "Yellow Marigold", gu: "પીળા મરીગોલ્ડ" }, quantity: 320, unit: "bundle", price_per_unit: 30, condition: "healthy" },
    { categoryIndex: 5, name: { en: "Red Rose", gu: "લાલ ગુલાબ" }, quantity: 48, unit: "piece", price_per_unit: 45, condition: "healthy" },
  ];

  let stockCreated = 0;
  for (const item of stockData) {
    const cat = categories[item.categoryIndex];
    if (!cat) continue;

    const exists = await StockItem.findOne({
      "name.en": item.name.en,
      registered_by: user._id,
    });

    if (!exists) {
      await StockItem.create({
        category_id: cat._id,
        name: item.name,
        image: "https://picsum.photos/id/106/300/200",
        condition_image: "",
        condition: item.condition,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        registered_by: user._id,
        notes: "",
        is_active: true,
      });
      stockCreated++;
    }
  }

  return NextResponse.json({
    success: true,
    message: "Full demo data seeded successfully!",
    credentials: {
      phone: DEMO_PHONE,
      password: DEMO_PASSWORD,
      nursery: "Green Leaf Nursery",
    },
    stats: {
      categories: categories.length,
      stockItems: stockCreated,
    },
  });
}

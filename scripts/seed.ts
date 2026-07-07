import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function loadModules() {
  const [{ connectDB }, User, PlantCategory, StockItem, bcrypt] = await Promise.all([
    import("../lib/db"),
    import("../models/User").then(m => m.default),
    import("../models/PlantCategory").then(m => m.default),
    import("../models/StockItem").then(m => m.default),
    import("bcryptjs").then(m => m.default),
  ]);
  return { connectDB, User, PlantCategory, StockItem, bcrypt };
}

// Demo farmer credentials for testing
const DEMO_PHONE = "9876543210";
const DEMO_PASSWORD = "123456";
const DEMO_NURSERY = "Green Leaf Nursery";
const DEMO_NAME = "Ramesh Patel";

async function seed() {
  console.log("🌱 Starting Nursery Manager Seed Script...\n");

  const { connectDB, User, PlantCategory, StockItem, bcrypt } = await loadModules();

  await connectDB();
  console.log("✅ Connected to MongoDB\n");

  // 1. Create or update the demo farmer user
  let user = await User.findOne({ phone: DEMO_PHONE });

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  if (!user) {
    user = await User.create({
      name: DEMO_NAME,
      phone: DEMO_PHONE,
      password: hashedPassword,
      nursery_name: DEMO_NURSERY,
      role: "farmer",
      language: "gu",
    });
    console.log("👤 Created new demo farmer user");
  } else {
    // Update password in case it changed
    user.password = hashedPassword;
    user.nursery_name = DEMO_NURSERY;
    await user.save();
    console.log("👤 Updated existing demo farmer user");
  }

  console.log(`   Name: ${user.name}`);
  console.log(`   Phone: ${DEMO_PHONE}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   Nursery: ${DEMO_NURSERY}\n`);

  // 2. Seed Plant Categories
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
        sort_order: categories.length,
      });
      console.log(`📁 Created category: ${data.emoji} ${data.name.gu} / ${data.name.en}`);
    } else {
      console.log(`📁 Category exists: ${data.emoji} ${data.name.gu}`);
    }
    categories.push(cat);
  }

  console.log(`\n✅ ${categories.length} categories ready\n`);

  // 3. Seed realistic Stock Items
  const stockData = [
    {
      categoryIndex: 0, // Tomato
      name: { en: "Hybrid Tomato", gu: "હાઇબ્રિડ ટમેટા" },
      quantity: 450,
      unit: "piece",
      price_per_unit: 6,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      notes: "Good quality hybrid variety",
    },
    {
      categoryIndex: 0,
      name: { en: "Desi Tomato", gu: "દેશી ટમેટા" },
      quantity: 120,
      unit: "piece",
      price_per_unit: 4,
      condition: "average",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      notes: "Local variety, slightly smaller",
    },
    {
      categoryIndex: 1, // Chilli
      name: { en: "Green Chilli", gu: "લીલું મરચું" },
      quantity: 380,
      unit: "piece",
      price_per_unit: 8,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
    },
    {
      categoryIndex: 1,
      name: { en: "Red Chilli", gu: "લાલ મરચું" },
      quantity: 95,
      unit: "kg",
      price_per_unit: 95,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    },
    {
      categoryIndex: 2, // Cabbage
      name: { en: "Fresh Cabbage", gu: "તાજી કોબી" },
      quantity: 85,
      unit: "piece",
      price_per_unit: 25,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    },
    {
      categoryIndex: 2,
      name: { en: "Small Cabbage", gu: "નાની કોબી" },
      quantity: 32,
      unit: "piece",
      price_per_unit: 15,
      condition: "average",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      notes: "Low stock - harvest soon",
    },
    {
      categoryIndex: 3, // Brinjal
      name: { en: "Long Brinjal", gu: "લાંબા રીંગણ" },
      quantity: 210,
      unit: "piece",
      price_per_unit: 12,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    {
      categoryIndex: 3,
      name: { en: "Round Brinjal", gu: "ગોળ રીંગણ" },
      quantity: 67,
      unit: "piece",
      price_per_unit: 10,
      condition: "poor",
      notes: "Some spots - sell quickly",
    },
    {
      categoryIndex: 4, // Marigold
      name: { en: "Yellow Marigold", gu: "પીળા મરીગોલ્ડ" },
      quantity: 320,
      unit: "bundle",
      price_per_unit: 30,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    },
    {
      categoryIndex: 5, // Rose
      name: { en: "Red Rose Plants", gu: "લાલ ગુલાબ" },
      quantity: 48,
      unit: "piece",
      price_per_unit: 45,
      condition: "healthy",
      mature_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    },
  ];

  let createdStock = 0;

  for (const item of stockData) {
    const category = categories[item.categoryIndex];
    if (!category) continue;

    const exists = await StockItem.findOne({
      "name.en": item.name.en,
      registered_by: user._id,
    });

    if (!exists) {
      await StockItem.create({
        category_id: category._id,
        name: item.name,
        image: "https://picsum.photos/id/106/300/200",
        condition_image: "",
        condition: item.condition as any,
        quantity: item.quantity,
        unit: item.unit as any,
        price_per_unit: item.price_per_unit,
        mature_date: item.mature_date,
        registered_by: user._id,
        notes: item.notes || "",
        is_active: true,
      });
      createdStock++;
      console.log(
        `🌱 Stock: ${item.name.gu} (${item.quantity} ${item.unit}) - ₹${item.price_per_unit} [${item.condition}]`
      );
    }
  }

  console.log(`\n✅ Seeded ${createdStock} new stock items`);

  // Final summary
  const totalStock = await StockItem.countDocuments({ registered_by: user._id, is_active: true });

  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEEDING COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 LOGIN CREDENTIALS FOR TESTING AS FARMER:");
  console.log(`   Phone Number: ${DEMO_PHONE}`);
  console.log(`   Password:     ${DEMO_PASSWORD}`);
  console.log(`   Nursery:      ${DEMO_NURSERY}`);
  console.log("\n🔗 Login at: http://localhost:3000/login");
  console.log("\n📦 You now have:");
  console.log(`   - ${categories.length} plant categories`);
  console.log(`   - ${totalStock} active stock items`);
  console.log("\n💡 Tip: Use the demo button on login page or these credentials directly.");
  console.log("=".repeat(50) + "\n");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });

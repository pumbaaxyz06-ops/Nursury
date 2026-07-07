# 🌱 Nursery Management Web App — Full Implementation Plan

> **Stack:** Next.js 14 (App Router) · MongoDB + Mongoose · Tailwind CSS · NextAuth.js · next-i18next · React Hook Form · Cloudinary (images) · jsPDF (bill generation)
>
> **Priority Language:** Gujarati (gu) · Secondary: English (en)
>
> **Target User:** Non-technical farmers. Every screen must be big-button, icon-first, readable at a glance.

---

## 1. Project Structure

```
nursery-app/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Bottom nav + header
│   │   ├── home/
│   │   │   └── page.tsx             ← Plant category grid
│   │   ├── stock/
│   │   │   ├── page.tsx             ← Stock list + filters
│   │   │   ├── add/
│   │   │   │   └── page.tsx         ← Add stock entry
│   │   │   └── [id]/
│   │   │       └── page.tsx         ← Edit stock entry
│   │   ├── sales/
│   │   │   ├── page.tsx             ← All sales list
│   │   │   └── new/
│   │   │       └── page.tsx         ← New sale + bill gen
│   │   └── bookings/
│   │       ├── page.tsx             ← All advance bookings
│   │       ├── new/
│   │       │   └── page.tsx         ← Add booking
│   │       └── [id]/
│   │           └── page.tsx         ← Booking detail + dispatch
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   ├── categories/
│   │   │   └── route.ts
│   │   ├── stock/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── sales/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── bookings/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── BottomNav.tsx
│   │   ├── PageHeader.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LangToggle.tsx
│   │   └── ConfirmDialog.tsx
│   ├── stock/
│   │   ├── StockCard.tsx
│   │   ├── StockForm.tsx
│   │   └── StockFilters.tsx
│   ├── sales/
│   │   ├── SaleRow.tsx
│   │   ├── SaleForm.tsx
│   │   └── BillPreview.tsx
│   └── bookings/
│       ├── BookingCard.tsx
│       ├── BookingForm.tsx
│       └── DispatchModal.tsx
├── lib/
│   ├── db.ts                        ← MongoDB connection
│   ├── auth.ts                      ← NextAuth config
│   ├── cloudinary.ts                ← Image upload helper
│   ├── generateBill.ts              ← jsPDF bill generator
│   └── sendSMS.ts                   ← SMS/WhatsApp notif (Twilio/MSG91)
├── models/
│   ├── User.ts
│   ├── PlantCategory.ts
│   ├── StockItem.ts
│   ├── Sale.ts
│   └── AdvanceBooking.ts
├── public/
│   └── locales/
│       ├── en/common.json
│       └── gu/common.json
├── i18n.ts
├── middleware.ts
├── tailwind.config.ts
└── .env.local
```

---

## 2. Tech Stack — Packages to Install

```bash
npx create-next-app@latest nursery-app --typescript --tailwind --app

cd nursery-app

# Auth
npm install next-auth bcryptjs

# DB
npm install mongoose

# Forms + Validation
npm install react-hook-form zod @hookform/resolvers

# Image Upload
npm install cloudinary next-cloudinary

# i18n (Multilingual)
npm install next-i18next react-i18next i18next

# PDF Bill
npm install jspdf jspdf-autotable

# Notifications
npm install twilio  # or msg91 SDK for Indian SMS

# Utilities
npm install date-fns react-hot-toast lucide-react
```

---

## 3. Environment Variables (`.env.local`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nursery

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# SMS (MSG91 recommended for India)
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=NURSER

# App
NEXT_PUBLIC_APP_NAME=Nursery Manager
NEXT_PUBLIC_DEFAULT_LANG=gu
```

---

## 4. MongoDB Schemas & Models

### 4.1 User Model (`models/User.ts`)

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;               // Login identifier
  password: string;
  nursery_name: string;
  role: "farmer" | "admin";
  language: "en" | "gu";
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true },
  phone:        { type: String, required: true, unique: true, trim: true },
  password:     { type: String, required: true },
  nursery_name: { type: String, required: true },
  role:         { type: String, enum: ["farmer", "admin"], default: "farmer" },
  language:     { type: String, enum: ["en", "gu"], default: "gu" },
}, { timestamps: { createdAt: "created_at" } });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
```

---

### 4.2 Plant Category Model (`models/PlantCategory.ts`)

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IPlantCategory extends Document {
  name: { en: string; gu: string };
  image: string;               // Cloudinary URL
  emoji: string;               // Quick visual fallback e.g. 🍅
  created_by: mongoose.Types.ObjectId;
  is_active: boolean;
  sort_order: number;
}

const PlantCategorySchema = new Schema<IPlantCategory>({
  name:       { en: { type: String, required: true }, gu: { type: String, required: true } },
  image:      { type: String, required: true },
  emoji:      { type: String, default: "🌱" },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  is_active:  { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.PlantCategory
  || mongoose.model<IPlantCategory>("PlantCategory", PlantCategorySchema);
```

---

### 4.3 Stock Item Model (`models/StockItem.ts`)

```typescript
import mongoose, { Schema, Document } from "mongoose";

export type StockCondition = "healthy" | "average" | "poor";
export type StockUnit = "piece" | "kg" | "gram" | "packet" | "bundle" | "tray";

export interface IStockItem extends Document {
  category_id:     mongoose.Types.ObjectId;
  name:            { en: string; gu: string };
  image:           string;             // Main product image
  condition_image: string;             // Current actual condition photo
  condition:       StockCondition;
  quantity:        number;
  unit:            StockUnit;
  price_per_unit:  number;
  mature_date:     Date;
  registered_by:   mongoose.Types.ObjectId;
  notes:           string;
  is_active:       boolean;
}

const StockItemSchema = new Schema<IStockItem>({
  category_id:     { type: Schema.Types.ObjectId, ref: "PlantCategory", required: true },
  name:            { en: { type: String, required: true }, gu: { type: String, required: true } },
  image:           { type: String, required: true },
  condition_image: { type: String },
  condition:       { type: String, enum: ["healthy", "average", "poor"], default: "healthy" },
  quantity:        { type: Number, required: true, min: 0 },
  unit:            { type: String, enum: ["piece","kg","gram","packet","bundle","tray"], default: "piece" },
  price_per_unit:  { type: Number, required: true, min: 0 },
  mature_date:     { type: Date },
  registered_by:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  notes:           { type: String, default: "" },
  is_active:       { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast filtering
StockItemSchema.index({ category_id: 1 });
StockItemSchema.index({ condition: 1 });
StockItemSchema.index({ mature_date: 1 });

export default mongoose.models.StockItem
  || mongoose.model<IStockItem>("StockItem", StockItemSchema);
```

---

### 4.4 Sale Model (`models/Sale.ts`)

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  stock_item_id:  mongoose.Types.ObjectId;
  name:           string;
  quantity:       number;
  unit:           string;
  price_per_unit: number;
  total:          number;
}

export interface ISale extends Document {
  bill_number:    string;
  farmer_id:      mongoose.Types.ObjectId;
  customer_name:  string;
  customer_phone: string;
  items:          ISaleItem[];
  subtotal:       number;
  discount:       number;
  final_amount:   number;
  payment_method: "cash" | "upi" | "credit";
  notes:          string;
  created_at:     Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  stock_item_id:  { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
  name:           { type: String, required: true },
  quantity:       { type: Number, required: true },
  unit:           { type: String, required: true },
  price_per_unit: { type: Number, required: true },
  total:          { type: Number, required: true },
}, { _id: false });

const SaleSchema = new Schema<ISale>({
  bill_number:    { type: String, unique: true },
  farmer_id:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_name:  { type: String, required: true },
  customer_phone: { type: String },
  items:          { type: [SaleItemSchema], required: true },
  subtotal:       { type: Number, required: true },
  discount:       { type: Number, default: 0 },
  final_amount:   { type: Number, required: true },
  payment_method: { type: String, enum: ["cash","upi","credit"], default: "cash" },
  notes:          { type: String, default: "" },
}, { timestamps: { createdAt: "created_at" } });

// Auto-generate bill number: NUR-YYYYMMDD-XXXX
SaleSchema.pre("save", async function (next) {
  if (!this.bill_number) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g,"");
    const count = await mongoose.model("Sale").countDocuments();
    this.bill_number = `NUR-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
```

---

### 4.5 Advance Booking Model (`models/AdvanceBooking.ts`)

```typescript
import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus = "pending" | "ready_to_dispatch" | "fulfilled" | "cancelled";

export interface IBookingItem {
  stock_item_id:  mongoose.Types.ObjectId;
  name:           string;
  quantity:       number;
  unit:           string;
  price_per_unit: number;
  total:          number;
}

export interface IAdvanceBooking extends Document {
  booking_number:        string;
  farmer_id:             mongoose.Types.ObjectId;
  customer_name:         string;
  customer_phone:        string;
  customer_address:      string;
  items:                 IBookingItem[];
  subtotal:              number;
  advance_paid:          number;
  balance_due:           number;
  status:                BookingStatus;
  expected_dispatch_date: Date;
  fulfilled_date?:       Date;
  driver_name?:          string;
  driver_phone?:         string;
  notes:                 string;
  notification_sent:     boolean;
}

const BookingItemSchema = new Schema<IBookingItem>({
  stock_item_id:  { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
  name:           { type: String, required: true },
  quantity:       { type: Number, required: true },
  unit:           { type: String, required: true },
  price_per_unit: { type: Number, required: true },
  total:          { type: Number, required: true },
}, { _id: false });

const AdvanceBookingSchema = new Schema<IAdvanceBooking>({
  booking_number:         { type: String, unique: true },
  farmer_id:              { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_name:          { type: String, required: true },
  customer_phone:         { type: String, required: true },
  customer_address:       { type: String, default: "" },
  items:                  { type: [BookingItemSchema], required: true },
  subtotal:               { type: Number, required: true },
  advance_paid:           { type: Number, default: 0 },
  balance_due:            { type: Number, required: true },
  status:                 { type: String, enum: ["pending","ready_to_dispatch","fulfilled","cancelled"], default: "pending" },
  expected_dispatch_date: { type: Date },
  fulfilled_date:         { type: Date },
  driver_name:            { type: String },
  driver_phone:           { type: String },
  notes:                  { type: String, default: "" },
  notification_sent:      { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate booking number: BK-YYYYMMDD-XXXX
AdvanceBookingSchema.pre("save", async function (next) {
  if (!this.booking_number) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g,"");
    const count = await mongoose.model("AdvanceBooking").countDocuments();
    this.booking_number = `BK-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// When status changes to 'fulfilled', deduct stock
AdvanceBookingSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.status === "fulfilled" && !doc.notification_sent) {
    // Deduct stock logic handled in API route
    // SMS notification triggered from API route
  }
});

export default mongoose.models.AdvanceBooking
  || mongoose.model<IAdvanceBooking>("AdvanceBooking", AdvanceBookingSchema);
```

---

## 5. Screens — Design & Flow

### Screen 1 — Login (`/login`)

**Design Goal:** One screen, phone number + PIN, no typing complexity.

```
┌─────────────────────────────────┐
│         🌱 Nursery Manager      │
│       નર્સરી મેનેજર              │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📱 ફોન નંબર / Phone     │  │
│  │  [___________________]   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🔐 પાસવર્ડ / Password    │  │
│  │  [___________________]   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │    🌿 લૉગ ઇન / Login     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

- Phone number as login ID (farmers remember phone, not email)
- Show/hide password toggle
- Full-width green CTA button
- Language toggle top-right (EN / ગુ)
- Session persists 30 days (no re-login frustration)

---

### Screen 2 — Home (`/home`)

**Design Goal:** Big image cards, each plant category visible at a glance. Tap → go to its stock.

```
┌─────────────────────────────────┐
│  🌱 Nursery Manager    [EN/ગુ]  │
│  ──────────────────────────     │
│  તમારી નર્સરી / Your Nursery   │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │  🍅      │  │  🌶️      │    │
│  │ [image]  │  │ [image]  │    │
│  │ ટમેટા    │  │ મરચું    │    │
│  │ 240 pcs  │  │ 80 pcs   │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │  🥬      │  │  🌸      │    │
│  │ [image]  │  │ [image]  │    │
│  │ કોબીજ   │  │ ફૂલ     │    │
│  │ 150 pcs  │  │ 60 pcs   │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  [+ નવી કેટેગરી ઉમેરો]          │
│  ──────────────────────────     │
│  🏠 Home  📦 Stock  💰 Sale  📋 Book │
└─────────────────────────────────┘
```

- 2-column grid, large tap targets
- Shows live total quantity badge per category
- Low stock warning badge (red dot) if < 10 units
- Bottom nav with icons + label (both EN and Gujarati)
- + button to add new category

---

### Screen 3 — Stock List (`/stock`)

**Design Goal:** See everything, filter fast, tap to edit.

```
┌─────────────────────────────────┐
│  ← સ્ટૉક / Stock              │
│                                 │
│  [🔍 શોધો / Search____________] │
│                                 │
│  Filters:                       │
│  [બધું▼] [કેટેગરી▼] [સ્થિતિ▼]  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🍅 ટામેટા - Tomato      │   │
│  │ [img]  સ્ટૉક: 240 નંગ  │   │
│  │        ભાવ: ₹5/નંગ     │   │
│  │        📅 28 Mar 2025   │   │
│  │        🟢 Healthy       │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🌶️ મરચું - Chilli       │   │
│  │ [img]  સ્ટૉક: 80 નંગ   │   │
│  │        ભાવ: ₹8/નંગ     │   │
│  │        📅 15 Apr 2025   │   │
│  │        🟡 Average       │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ નવો સ્ટૉક ઉમેરો]           │
└─────────────────────────────────┘
```

**Filters:**
- Category (plant type)
- Condition: Healthy / Average / Poor
- Mature Date range
- Low Stock (< 20 units)
- Sort: Newest / Oldest / Stock Low→High

---

### Screen 4 — Add / Edit Stock (`/stock/add` or `/stock/[id]`)

```
┌─────────────────────────────────┐
│  ← નવો સ્ટૉક / Add Stock       │
│                                 │
│  Category *                     │
│  [Dropdown: ટમેટા▼]            │
│                                 │
│  Name (gu) *   Name (en) *      │
│  [ટામેટા____] [Tomato______]   │
│                                 │
│  Product Image *                │
│  [📷 ફોટો પાડો / Upload]       │
│                                 │
│  Condition Image                │
│  [📷 વર્તમાન સ્થિતિ ફોટો]     │
│                                 │
│  Condition *                    │
│  🟢 Healthy  🟡 Average  🔴 Poor│
│                                 │
│  Qty *        Unit *            │
│  [240_______] [નંગ▼]           │
│                                 │
│  Price/Unit * Mature Date *     │
│  [₹5________] [📅 28 Mar 2025] │
│                                 │
│  Notes                          │
│  [__________________________]  │
│                                 │
│  [💾 સ્ટૉક સેવ કરો]            │
└─────────────────────────────────┘
```

---

### Screen 5 — New Sale (`/sales/new`)

**Design Goal:** Quick checkout — search stock, pick qty, generate bill.

```
┌─────────────────────────────────┐
│  ← નવું વેચાણ / New Sale        │
│                                 │
│  Customer Name *                │
│  [_____________________________]│
│                                 │
│  Customer Phone                 │
│  [_____________________________]│
│                                 │
│  ─── Items ──────────────────   │
│  [🔍 સ્ટૉક શોધો / Search Stock] │
│                                 │
│  ┌────────────────────────────┐ │
│  │ 🍅 ટામેટા  Qty:[50_] ₹250 │ │
│  │                    [✕]    │ │
│  └────────────────────────────┘ │
│                                 │
│  [+ બીજો આઇટમ ઉમેરો]           │
│                                 │
│  Subtotal:           ₹ 250      │
│  Discount:     [0___________]   │
│  Total:              ₹ 250      │
│                                 │
│  Payment: 💵 Cash  📱 UPI  📝 Credit │
│                                 │
│  [🧾 વેચાણ & બિલ / Sale & Bill] │
└─────────────────────────────────┘
```

**On Sale & Bill click:**
1. Deduct quantities from StockItem in DB
2. Create Sale record
3. Generate jsPDF bill (download or print)
4. Toast: "વેચાણ સફળ! / Sale Saved!"

---

### Screen 6 — Sales List (`/sales`)

```
┌─────────────────────────────────┐
│  ← વેચાણ / Sales               │
│                                 │
│  [📅 Date Filter] [🔍 Search]   │
│                                 │
│  Today: ₹ 1,250                 │
│  This Month: ₹ 18,400           │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📋 NUR-20250315-0012    │   │
│  │ Raju Patel · 15 Mar     │   │
│  │ 50 ટામેટા, 20 મરચું    │   │
│  │ ₹ 650     💵 Cash       │   │
│  │            [🧾 Bill]    │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### Screen 7 — Advance Bookings (`/bookings`)

**Design Goal:** Status-based view. Clear visual for each state.

```
┌─────────────────────────────────┐
│  ← અગ્રિમ બુકિંગ / Bookings    │
│                                 │
│  [⏳ Pending] [🚚 Dispatch] [✅ Done] │
│                                 │
│  ── Pending (3) ──────────────  │
│  ┌─────────────────────────┐   │
│  │ 📋 BK-20250310-0003     │   │
│  │ Haresh Farmer           │   │
│  │ 2000 ટામેટા બીજ         │   │
│  │ ₹1000 paid · ₹1000 due  │   │
│  │ 📅 Expected: 20 Mar     │   │
│  │ [🚚 Dispatch Ready]     │   │
│  └─────────────────────────┘   │
│                                 │
│  ── Ready to Dispatch (1) ──   │
│  ┌─────────────────────────┐   │
│  │ 📋 BK-20250308-0001     │   │
│  │ Ramesh Shah             │   │
│  │ 500 મરચું               │   │
│  │ 🚗 Driver: Jay · 9876..  │   │
│  │ [✅ Mark Fulfilled]     │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ નવી બુકિંગ]                 │
└─────────────────────────────────┘
```

**Booking Lifecycle:**
```
[pending] → [ready_to_dispatch] → [fulfilled]
                                ↑
                         Stock deducted here
                         SMS sent to customer
```

---

### Screen 8 — Add Booking (`/bookings/new`)

```
┌─────────────────────────────────┐
│  ← નવી બુકિંગ / New Booking    │
│                                 │
│  Customer Name *                │
│  [_____________________________]│
│                                 │
│  Customer Phone * (SMS goes here)│
│  [_____________________________]│
│                                 │
│  Customer Address               │
│  [_____________________________]│
│                                 │
│  ─── Items ──────────────────   │
│  [🔍 સ્ટૉક શોધો]               │
│                                 │
│  ┌────────────────────────────┐ │
│  │ 🌱 ટામેટા બીજ  Qty:[2000] │ │
│  │ ₹0.50/piece = ₹1,000      │ │
│  └────────────────────────────┘ │
│                                 │
│  Total: ₹ 1,000                 │
│  Advance Paid: [₹500_________]  │
│  Balance Due:  ₹ 500            │
│                                 │
│  Expected Dispatch Date         │
│  [📅 20 Mar 2025]               │
│                                 │
│  Notes                          │
│  [__________________________]  │
│                                 │
│  [✅ બુકિંગ સેવ કરો]            │
└─────────────────────────────────┘
```

---

### Screen 9 — Dispatch Modal

When farmer taps "Mark Fulfilled":

```
┌─────────────────────────────────┐
│       🚚 ડ્રાઇવર વિગત          │
│                                 │
│  Driver Name *                  │
│  [Jay Patel________________]   │
│                                 │
│  Driver Phone *                 │
│  [9876543210_______________]   │
│                                 │
│  Note (optional)                │
│  [__________________________]  │
│                                 │
│  ⚠️ Stock will be deducted now  │
│  SMS will be sent to customer   │
│                                 │
│  [✅ Confirm & Dispatch]        │
│  [Cancel]                       │
└─────────────────────────────────┘
```

**On Confirm:**
1. Update booking status → `fulfilled`
2. Set `fulfilled_date`, `driver_name`, `driver_phone`
3. Deduct each item's quantity from StockItem
4. Send SMS to `customer_phone`: "તમારો ઓર્ડર {booking_number} નીકળ્યો છે. ડ્રાઇવર: {driver_name} - {driver_phone}"

---

## 6. i18n Translations (`public/locales/`)

### `gu/common.json` (Gujarati — Priority)

```json
{
  "app_name": "નર્સરી મેનેજર",
  "login": "લૉગ ઇન",
  "phone": "ફોન નંબર",
  "password": "પાસવર્ડ",
  "home": "ઘર",
  "stock": "સ્ટૉક",
  "sales": "વેચાણ",
  "bookings": "બુકિંગ",
  "add_stock": "સ્ટૉક ઉમેરો",
  "add_sale": "વેચાણ ઉમેરો",
  "add_booking": "બુકિંગ ઉમેરો",
  "quantity": "જથ્થો",
  "price": "ભાવ",
  "customer": "ગ્રાહક",
  "status": "સ્થિતિ",
  "pending": "બાકી",
  "ready_to_dispatch": "નીકળવા તૈયાર",
  "fulfilled": "પૂર્ણ",
  "cancelled": "રદ",
  "healthy": "સ્વસ્થ",
  "average": "સામાન્ય",
  "poor": "નબળો",
  "save": "સેવ",
  "cancel": "રદ",
  "confirm": "ખાતરી",
  "bill": "બિલ",
  "driver": "ડ્રાઇવર",
  "dispatch": "ડિસ્પૅચ",
  "mature_date": "પાકવાની તારીખ",
  "advance_paid": "અગ્રિમ ચૂક્વ્યા",
  "balance_due": "બાકી ચૂકવણી",
  "search_stock": "સ્ટૉક શોધો",
  "low_stock_warning": "ઓછો સ્ટૉક!",
  "sale_success": "વેચાણ સફળ!",
  "booking_saved": "બુકિંગ સેવ!",
  "dispatch_confirmed": "ડિસ્પૅચ ખાતરી!",
  "sms_sent": "SMS મોકલ્યો",
  "order_dispatched_sms": "તમારો ઓર્ડર {{booking_number}} નીકળ્યો છે. ડ્રાઇવર: {{driver_name}} - {{driver_phone}}"
}
```

### `en/common.json` (English)

```json
{
  "app_name": "Nursery Manager",
  "login": "Login",
  "phone": "Phone Number",
  "password": "Password",
  "home": "Home",
  "stock": "Stock",
  "sales": "Sales",
  "bookings": "Bookings",
  "add_stock": "Add Stock",
  "add_sale": "New Sale",
  "add_booking": "New Booking",
  "quantity": "Quantity",
  "price": "Price",
  "customer": "Customer",
  "status": "Status",
  "pending": "Pending",
  "ready_to_dispatch": "Ready to Dispatch",
  "fulfilled": "Fulfilled",
  "cancelled": "Cancelled",
  "healthy": "Healthy",
  "average": "Average",
  "poor": "Poor",
  "save": "Save",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "bill": "Bill",
  "driver": "Driver",
  "dispatch": "Dispatch",
  "mature_date": "Mature Date",
  "advance_paid": "Advance Paid",
  "balance_due": "Balance Due",
  "search_stock": "Search Stock",
  "low_stock_warning": "Low Stock!",
  "sale_success": "Sale Saved!",
  "booking_saved": "Booking Saved!",
  "dispatch_confirmed": "Dispatch Confirmed!",
  "sms_sent": "SMS Sent",
  "order_dispatched_sms": "Your order {{booking_number}} is on the way. Driver: {{driver_name}} - {{driver_phone}}"
}
```

---

## 7. Key API Routes

### Auth
```
POST /api/auth/[...nextauth]    — Login (NextAuth credentials)
```

### Categories
```
GET  /api/categories            — List all categories with live stock counts
POST /api/categories            — Create category
```

### Stock
```
GET  /api/stock                 — List stock (query: category, condition, mature_date, search)
POST /api/stock                 — Add stock item
GET  /api/stock/[id]            — Get single item
PUT  /api/stock/[id]            — Edit stock item
```

### Sales
```
GET  /api/sales                 — List all sales (with date filters)
POST /api/sales                 — Create sale → auto-deduct stock → return bill data
GET  /api/sales/[id]            — Get sale for bill reprint
```

### Bookings
```
GET  /api/bookings              — List all bookings (filter by status)
POST /api/bookings              — Create booking
GET  /api/bookings/[id]         — Get booking detail
PUT  /api/bookings/[id]         — Update status / dispatch details
                                  → on 'fulfilled': deduct stock + send SMS
```

---

## 8. Bill PDF Generation (`lib/generateBill.ts`)

```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateBill(sale: any, nurseryName: string): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text(nurseryName, 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Bill No: ${sale.bill_number}`, 14, 35);
  doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString("gu-IN")}`, 14, 42);
  doc.text(`Customer: ${sale.customer_name}`, 14, 49);
  if (sale.customer_phone) doc.text(`Phone: ${sale.customer_phone}`, 14, 56);

  // Items table
  autoTable(doc, {
    startY: 65,
    head: [["Item", "Qty", "Unit", "Rate", "Total"]],
    body: sale.items.map((item: any) => [
      item.name,
      item.quantity,
      item.unit,
      `₹${item.price_per_unit}`,
      `₹${item.total}`,
    ]),
    foot: [
      ["", "", "", "Subtotal", `₹${sale.subtotal}`],
      ["", "", "", "Discount", `₹${sale.discount}`],
      ["", "", "", "Total", `₹${sale.final_amount}`],
    ],
    footStyles: { fontStyle: "bold" },
  });

  doc.save(`${sale.bill_number}.pdf`);
}
```

---

## 9. SMS Notification (`lib/sendSMS.ts`)

```typescript
// Using MSG91 — best for India, supports Gujarati Unicode
export async function sendDispatchSMS(
  customerPhone: string,
  bookingNumber: string,
  driverName: string,
  driverPhone: string,
  lang: "gu" | "en" = "gu"
): Promise<void> {
  const message = lang === "gu"
    ? `તમારો ઓર્ડર ${bookingNumber} નીકળ્યો છે. ડ્રાઇવર: ${driverName} - ${driverPhone}. - Nursery Manager`
    : `Your order ${bookingNumber} is on the way. Driver: ${driverName} - ${driverPhone}. - Nursery Manager`;

  const payload = {
    sender: process.env.MSG91_SENDER_ID,
    route: "4",
    country: "91",
    sms: [{
      message,
      to: [`91${customerPhone}`],
    }],
  };

  await fetch("https://api.msg91.com/api/sendhttp.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authkey": process.env.MSG91_AUTH_KEY!,
    },
    body: JSON.stringify(payload),
  });
}
```

---

## 10. UI/UX Principles for Farmers

| Principle | Implementation |
|-----------|---------------|
| **Big touch targets** | Min button height 56px on mobile |
| **Icon + text always** | Never icon alone — emoji + label in Gujarati |
| **Color-coded status** | 🟢 Green=Good, 🟡 Yellow=Average, 🔴 Red=Poor/Low |
| **No jargon** | "Stock" not "Inventory", "Photo" not "Upload Image" |
| **Confirm before delete** | Always show confirm dialog in Gujarati |
| **Offline-aware** | Show toast if network drops, retry on reconnect |
| **Big fonts** | Base font 16px min, headings 20-24px |
| **Auto-save drafts** | Use localStorage for unsaved forms |

---

## 11. Implementation Steps (Order of Work)

### Phase 1 — Foundation (Week 1)
- [ ] Init Next.js project, Tailwind, folder structure
- [ ] Setup MongoDB connection (`lib/db.ts`)
- [ ] Create all 5 Mongoose models
- [ ] Setup NextAuth with credentials provider
- [ ] Build Login screen
- [ ] Setup next-i18next, add all Gujarati + English strings
- [ ] Build BottomNav component

### Phase 2 — Stock Core (Week 2)
- [ ] Build PlantCategory API (CRUD)
- [ ] Build Stock API (CRUD + filters)
- [ ] Home screen — category grid with live counts
- [ ] Stock list screen with search + filters
- [ ] Add/Edit Stock form with Cloudinary image upload

### Phase 3 — Sales (Week 3)
- [ ] Build Sales API
- [ ] New Sale screen — stock search, add items, qty check
- [ ] Auto-deduct stock on sale save
- [ ] jsPDF bill generation
- [ ] Sales list screen with date filters + bill reprint

### Phase 4 — Bookings (Week 4)
- [ ] Build Bookings API
- [ ] New Booking screen
- [ ] Bookings list with status tabs
- [ ] Dispatch modal (driver details)
- [ ] Stock deduction on fulfillment
- [ ] MSG91 SMS integration

### Phase 5 — Polish (Week 5)
- [ ] Language toggle persistent in localStorage
- [ ] Low stock alerts on Home screen
- [ ] Mobile responsiveness pass
- [ ] Error states and empty states (all in Gujarati)
- [ ] Loading skeletons
- [ ] Test on actual Android device (farmers use Android)

---

## 12. Tailwind Color Palette (Farmer-Friendly Green Theme)

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary:   "#2E7D32",   // Deep green — trust, nature
      primary_light: "#4CAF50",
      accent:    "#FF8F00",   // Amber — CTAs, warnings
      surface:   "#F9FBF9",   // Off-white background
      card:      "#FFFFFF",
      success:   "#43A047",
      warning:   "#FB8C00",
      danger:    "#E53935",
      text:      "#1B1B1B",
      muted:     "#6B7280",
    },
    fontFamily: {
      sans: ["Noto Sans Gujarati", "Inter", "sans-serif"],
      // Noto Sans Gujarati renders Gujarati + English in one font
    }
  }
}
```

Add to `app/layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;600;700&display=swap" rel="stylesheet" />
```

---

## 13. Quick Reference — All Screens Summary

| Route | Screen | Primary Action |
|-------|---------|---------------|
| `/login` | Login | Phone + Password |
| `/home` | Plant Categories | Tap → stock of that plant |
| `/stock` | All Stock List | Search, filter, tap to edit |
| `/stock/add` | Add Stock | New stock entry |
| `/stock/[id]` | Edit Stock | Update qty, condition, image |
| `/sales` | Sales History | List + date filter + bill reprint |
| `/sales/new` | New Sale | Pick items, generate bill |
| `/bookings` | Booking List | Tabs: Pending / Ready / Done |
| `/bookings/new` | New Booking | Add advance booking |
| `/bookings/[id]` | Booking Detail | View, change status, dispatch |

---

*Built for Gujarat farmers. Gujarati first, always.*

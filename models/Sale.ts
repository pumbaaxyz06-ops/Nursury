import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  stock_item_id: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
}

export interface ISale extends Document {
  bill_number: string;
  farmer_id: mongoose.Types.ObjectId;
  customer_name: string;
  customer_phone: string;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  final_amount: number;
  payment_method: "cash" | "upi" | "credit";
  notes: string;
  created_at: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  stock_item_id: { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price_per_unit: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

const SaleSchema = new Schema<ISale>({
  bill_number: { type: String, unique: true },
  farmer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_name: { type: String, required: true },
  customer_phone: { type: String },
  items: { type: [SaleItemSchema], required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  final_amount: { type: Number, required: true },
  payment_method: { type: String, enum: ["cash", "upi", "credit"], default: "cash" },
  notes: { type: String, default: "" },
}, { timestamps: { createdAt: "created_at" } });

// Auto bill number: NUR-YYYYMMDD-XXXX
SaleSchema.pre("save", async function () {
  if (!this.bill_number) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("Sale").countDocuments();
    this.bill_number = `NUR-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  // No next() call needed for async hooks
});

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);

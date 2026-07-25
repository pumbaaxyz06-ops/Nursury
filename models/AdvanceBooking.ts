import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus = "pending" | "ready_to_dispatch" | "fulfilled" | "cancelled";

export interface IBookingItem {
  stock_item_id: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
}

export interface IAdvanceBooking extends Document {
  booking_number: string;
  farmer_id: mongoose.Types.ObjectId;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: IBookingItem[];
  subtotal: number;
  advance_paid: number;
  balance_due: number;
  status: BookingStatus;
  expected_dispatch_date: Date;
  fulfilled_date?: Date;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  notes: string;
  notification_sent: boolean;
}

const BookingItemSchema = new Schema<IBookingItem>({
  stock_item_id: { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price_per_unit: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

const AdvanceBookingSchema = new Schema<IAdvanceBooking>({
  booking_number: { type: String, unique: true },
  farmer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customer_name: { type: String, required: true },
  customer_phone: { type: String, required: true },
  customer_address: { type: String, default: "" },
  items: { type: [BookingItemSchema], required: true },
  subtotal: { type: Number, required: true },
  advance_paid: { type: Number, default: 0 },
  balance_due: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "ready_to_dispatch", "fulfilled", "cancelled"],
    default: "pending",
  },
  expected_dispatch_date: { type: Date },
  fulfilled_date: { type: Date },
  driver_name: { type: String },
  driver_phone: { type: String },
  vehicle_number: { type: String, default: "" },
  notes: { type: String, default: "" },
  notification_sent: { type: Boolean, default: false },
}, { timestamps: true });

// Auto booking number
AdvanceBookingSchema.pre("save", async function () {
  if (!this.booking_number) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("AdvanceBooking").countDocuments();
    this.booking_number = `BK-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  // No next() call needed for async hooks in modern Mongoose
});

export default mongoose.models.AdvanceBooking ||
  mongoose.model<IAdvanceBooking>("AdvanceBooking", AdvanceBookingSchema);

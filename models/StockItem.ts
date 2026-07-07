import mongoose, { Schema, Document } from "mongoose";

export type StockCondition = "healthy" | "average" | "poor";
export type StockUnit = "piece" | "kg" | "gram" | "packet" | "bundle" | "tray";

export interface IStockItem extends Document {
  category_id: mongoose.Types.ObjectId;
  name: { en: string; gu: string };
  image: string;
  condition_image: string;
  condition: StockCondition;
  quantity: number;
  unit: StockUnit;
  price_per_unit: number;
  mature_date: Date;
  registered_by: mongoose.Types.ObjectId;
  notes: string;
  is_active: boolean;
}

const StockItemSchema = new Schema<IStockItem>({
  category_id: { type: Schema.Types.ObjectId, ref: "PlantCategory", required: true },
  name: {
    en: { type: String, required: true },
    gu: { type: String, required: true },
  },
  image: { type: String, required: true },
  condition_image: { type: String },
  condition: { type: String, enum: ["healthy", "average", "poor"], default: "healthy" },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ["piece", "kg", "gram", "packet", "bundle", "tray"], default: "piece" },
  price_per_unit: { type: Number, required: true, min: 0 },
  mature_date: { type: Date },
  registered_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  notes: { type: String, default: "" },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

StockItemSchema.index({ category_id: 1 });
StockItemSchema.index({ condition: 1 });
StockItemSchema.index({ mature_date: 1 });

export default mongoose.models.StockItem ||
  mongoose.model<IStockItem>("StockItem", StockItemSchema);

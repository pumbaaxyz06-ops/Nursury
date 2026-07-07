import mongoose, { Schema, Document } from "mongoose";

export interface IPlantCategory extends Document {
  name: { en: string; gu: string };
  image: string;
  emoji: string;
  created_by: mongoose.Types.ObjectId;
  is_active: boolean;
  sort_order: number;
}

const PlantCategorySchema = new Schema<IPlantCategory>({
  name: {
    en: { type: String, required: true },
    gu: { type: String, required: true },
  },
  image: { type: String, required: true },
  emoji: { type: String, default: "🌱" },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.PlantCategory ||
  mongoose.model<IPlantCategory>("PlantCategory", PlantCategorySchema);

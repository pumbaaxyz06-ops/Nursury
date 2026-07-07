import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  nursery_name: string;
  role: "farmer" | "admin";
  language: "en" | "gu";
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  nursery_name: { type: String, required: true },
  role: { type: String, enum: ["farmer", "admin"], default: "farmer" },
  language: { type: String, enum: ["en", "gu"], default: "gu" },
}, { timestamps: { createdAt: "created_at" } });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

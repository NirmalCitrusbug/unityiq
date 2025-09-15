import mongoose from "mongoose";

export interface BrandDocument extends mongoose.Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Brand = mongoose.model<BrandDocument>("Brand", brandSchema);

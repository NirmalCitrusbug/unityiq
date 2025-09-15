import mongoose from "mongoose";

export interface LocationDocument extends mongoose.Document {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique location
locationSchema.index({name: 1, city: 1, state: 1, country: 1}, {unique: true});

export const Location = mongoose.model<LocationDocument>(
  "Location",
  locationSchema
);

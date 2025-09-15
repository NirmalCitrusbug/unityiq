import mongoose from "mongoose";

interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface StoreDocument extends mongoose.Document {
  brandId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  location: GeoLocation;
  geofenceRadius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    geofenceRadius: {
      type: Number,
      required: true,
      default: 100, // Default radius in meters
      min: 10,
      max: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of brand and location
storeSchema.index({brandId: 1, locationId: 1}, {unique: true});

// Add a method to populate brand and location details
storeSchema.methods.withDetails = function () {
  return this.populate("brandId").populate("locationId");
};

export const Store = mongoose.model<StoreDocument>("Store", storeSchema);

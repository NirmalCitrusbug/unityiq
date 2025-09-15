import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  roleId: mongoose.Types.ObjectId;
  storeIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  verifyPin(pin: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    pin: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^\d{4}$/.test(v);
        },
        message: "PIN must be exactly 4 digits",
      },
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    storeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to assign all stores to admin users
userSchema.pre("save", async function (next) {
  try {
    // Get the role document
    const Role = mongoose.model("Role");
    const role = await Role.findById(this.roleId);

    // If it's an admin role
    if (role?.name === "Admin") {
      // Get all active stores
      const Store = mongoose.model("Store");
      const allStores = await Store.find({isActive: true});

      // Assign all store IDs to the admin user
      this.storeIds = allStores.map((store) => store._id);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to verify PIN
userSchema.methods.verifyPin = function (pin: string): boolean {
  return this.pin === pin;
};

// Method to get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Add indexes
userSchema.index({storeIds: 1}); // Index on the array of store IDs
userSchema.index({roleId: 1});

export const User = mongoose.model<UserDocument>("User", userSchema);

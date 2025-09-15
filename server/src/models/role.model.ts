import mongoose from "mongoose";

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionMap {
  users: Permission;
  roles: Permission;
  brands: Permission;
  locations: Permission;
  stores: Permission;
  // Add other permission categories as needed
}

export interface RoleDocument extends mongoose.Document {
  name: string;
  permissions: PermissionMap;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: {
      users: {
        create: {type: Boolean, default: false},
        read: {type: Boolean, default: false},
        update: {type: Boolean, default: false},
        delete: {type: Boolean, default: false},
      },
      roles: {
        create: {type: Boolean, default: false},
        read: {type: Boolean, default: false},
        update: {type: Boolean, default: false},
        delete: {type: Boolean, default: false},
      },
      brands: {
        create: {type: Boolean, default: false},
        read: {type: Boolean, default: false},
        update: {type: Boolean, default: false},
        delete: {type: Boolean, default: false},
      },
      locations: {
        create: {type: Boolean, default: false},
        read: {type: Boolean, default: false},
        update: {type: Boolean, default: false},
        delete: {type: Boolean, default: false},
      },
      stores: {
        create: {type: Boolean, default: false},
        read: {type: Boolean, default: false},
        update: {type: Boolean, default: false},
        delete: {type: Boolean, default: false},
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<RoleDocument>("Role", roleSchema);

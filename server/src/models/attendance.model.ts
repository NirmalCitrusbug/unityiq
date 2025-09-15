import mongoose from "mongoose";

interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface AttendanceDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  clockIn: {
    time: Date;
    location: GeoLocation;
    image?: {
      data: Buffer;
      contentType: string;
    };
  };
  clockOut?: {
    time: Date;
    location: GeoLocation;
  };
  status: "ACTIVE" | "COMPLETED";
  duration?: number; // in minutes
  isWithinGeofence: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    clockIn: {
      time: {
        type: Date,
        required: true,
      },
      image: {
        data: Buffer,
        contentType: String
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    clockOut: {
      time: Date,
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
    },
    duration: {
      type: Number,
      min: 0,
    },
    isWithinGeofence: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ userId: 1, storeId: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ "clockIn.time": 1 });
attendanceSchema.index({ "clockOut.time": 1 });
attendanceSchema.index({ "clockIn.location": "2dsphere" });
attendanceSchema.index({ "clockOut.location": "2dsphere" });

// Prevent multiple active attendances for the same user
attendanceSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("status")) {
    const activeAttendance = await mongoose.model("Attendance").findOne({
      userId: this.userId,
      status: "ACTIVE",
      _id: { $ne: this._id },
    });

    if (activeAttendance) {
      const err = new Error("User already has an active attendance record");
      return next(err);
    }
  }
  next();
});

// Calculate duration when clocking out
attendanceSchema.pre<AttendanceDocument>("save", function (next) {
  if (
    this.clockOut &&
    this.clockOut.time &&
    this.clockIn &&
    this.clockIn.time
  ) {
    const clockOutTime = this.clockOut.time.getTime();
    const clockInTime = this.clockIn.time.getTime();
    this.duration = Math.round((clockOutTime - clockInTime) / 1000 / 60);
    this.status = "COMPLETED";
  }
  next();
});

export const Attendance = mongoose.model<AttendanceDocument>(
  "Attendance",
  attendanceSchema
);

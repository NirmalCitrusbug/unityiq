import mongoose from "mongoose";
import { Attendance, Store } from "@/models";
import { ApiError } from "@/utils";
import { logger } from "@/config";

interface ClockInData {
  userId: string;
  storeId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  image?: {
    data: Buffer;
    contentType: string;
  };
}

interface ClockOutData {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

class AttendanceService {
  /**
   * Calculate distance between two points using the Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if a location is within the store's geofence
   */
  private async isWithinGeofence(
    storeId: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    const store = await Store.findById(storeId);
    if (!store) {
      throw new ApiError(404, "Store not found");
    }

    const distance = this.calculateDistance(
      latitude,
      longitude,
      store.location.coordinates[1], // store latitude
      store.location.coordinates[0] // store longitude
    );

    return distance <= store.geofenceRadius;
  }

  /**
   * Clock in a user at a store
   */
  async clockIn(data: ClockInData) {
    const { userId, storeId, location, image } = data;

    // Check if user already has an active attendance
    const existingAttendance = await Attendance.findOne({
      userId,
      status: "ACTIVE",
    });

    if (existingAttendance) {
      throw new ApiError(400, "User already clocked in");
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      throw new ApiError(404, "Store not found");
    }

    // Check geofence
    const isWithinGeofence = await this.isWithinGeofence(
      storeId,
      location.latitude,
      location.longitude
    );

    // Create new attendance record
    const attendance = new Attendance({
      userId: new mongoose.Types.ObjectId(userId),
      storeId: new mongoose.Types.ObjectId(storeId),
      status: "ACTIVE",
      clockIn: {
        time: new Date(),
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
        ...(image && {
          image: {
            data: image.data,
            contentType: image.contentType,
          },
        }),
      },
      isWithinGeofence,
    });

    await attendance.save();
    return attendance;
  }

  /**
   * Clock out a user
   */
  async clockOut({ userId, location }: ClockOutData) {
    try {
      // Find active attendance record
      const attendance = await Attendance.findOne({
        userId,
        status: "ACTIVE",
      });

      if (!attendance) {
        throw new ApiError(400, "No active attendance record found");
      }

      // Verify location is within store's geofence
      const isWithinGeofence = await this.isWithinGeofence(
        attendance.storeId.toString(),
        location.latitude,
        location.longitude
      );

      // Update attendance record
      attendance.clockOut = {
        time: new Date(),
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
      };
      attendance.isWithinGeofence = isWithinGeofence;

      await attendance.save();

      return attendance;
    } catch (error) {
      logger.error({ error, userId, location }, "Clock out failed");
      throw error;
    }
  }

  /**
   * Get user's attendance history
   */
  async getUserAttendance(userId: string, startDate?: Date, endDate?: Date) {
    const query: any = { userId };

    if (startDate || endDate) {
      query["clockIn.time"] = {};
      if (startDate) query["clockIn.time"].$gte = startDate;
      if (endDate) query["clockIn.time"].$lte = endDate;
    }

    const attendance = await Attendance.find(query)
      .sort({ "clockIn.time": -1 })
      .populate("storeId", "name location");

    return attendance;
  }

  /**
   * Get user's current clock-in status
   */
  async getStatus(userId: string) {
    try {
      const activeAttendance = await Attendance.findOne({
        userId,
        status: "ACTIVE",
      })
        .populate("storeId", "name location geofenceRadius")
        .populate("userId", "firstName lastName email");

      if (!activeAttendance) {
        return {
          isClockedIn: false,
          lastAttendance: await Attendance.findOne({ userId })
            .sort({ "clockIn.time": -1 })
            .populate("storeId", "name location geofenceRadius")
            .populate("userId", "firstName lastName email"),
        };
      }

      const clockInTime = activeAttendance.clockIn.time;
      const currentTime = new Date();
      const durationInMinutes = Math.floor(
        (currentTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      );

      return {
        isClockedIn: true,
        currentAttendance: {
          ...activeAttendance.toObject(),
          duration: durationInMinutes,
        },
      };
    } catch (error) {
      logger.error({ error, userId }, "Failed to get clock-in status");
      throw error;
    }
  }

  /**
   * Generate attendance report
   */
  async generateReport(query: {
    userId?: string;
    storeId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: "ACTIVE" | "COMPLETED";
  }): Promise<any[]> {
    try {
      const { userId, storeId, startDate, endDate, status } = query;

      // Build the match query
      const match: any = {};
      if (userId) match.userId = new mongoose.Types.ObjectId(userId);
      if (storeId) match.storeId = new mongoose.Types.ObjectId(storeId);
      if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
      }
      if (status) match.status = status;

      const pipeline = [
        { $match: match },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        {
          $lookup: {
            from: "stores",
            localField: "storeId",
            foreignField: "_id",
            as: "storeId",
          },
        },
        { $unwind: "$storeId" },
        // Lookup brand details
        {
          $lookup: {
            from: "brands",
            localField: "storeId.brandId",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
        // Lookup location details
        {
          $lookup: {
            from: "locations",
            localField: "storeId.locationId",
            foreignField: "_id",
            as: "location",
          },
        },
        { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            "userId._id": 1,
            "userId.firstName": 1,
            "userId.lastName": 1,
            "userId.email": 1,
            fullName: {
              $concat: ["$userId.firstName", " ", "$userId.lastName"],
            },
            "storeId._id": 1,
            "storeId.name": 1,
            "storeId.address": 1,
            "storeId.geofenceRadius": 1,
            "storeId.location": 1,
            brand: {
              _id: "$brand._id",
              name: "$brand.name",
              description: "$brand.description",
              logo: "$brand.logo",
            },
            location: {
              _id: "$location._id",
              name: "$location.name",
              address: "$location.address",
              city: "$location.city",
              state: "$location.state",
              country: "$location.country",
              postalCode: "$location.postalCode",
              coordinates: "$location.coordinates",
            },
            status: 1,
            isWithinGeofence: 1,
            clockIn: {
              time: 1,
              location: 1,
              image: {
                $cond: {
                  if: { $ifNull: ["$clockIn.image", false] },
                  then: {
                    $concat: [
                      "$clockIn.image.contentType",
                      ";base64,",
                      { $toString: "$clockIn.image.data" },
                    ],
                  },
                  else: null,
                },
              },
            },
            clockOut: {
              time: 1,
              location: 1,
            },
            duration: {
              $cond: {
                if: { $gt: ["$clockOut.time", null] },
                then: {
                  $divide: [
                    { $subtract: ["$clockOut.time", "$clockIn.time"] },
                    1000 * 60, // Convert to minutes
                  ],
                },
                else: null,
              },
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { "clockIn.time": -1 } },
      ];

      const report = await Attendance.aggregate(pipeline as any[]);
      return report;
    } catch (error: any) {
      logger.error(
        { error: error.message, query },
        "Failed to generate attendance report"
      );
      throw new Error(`Failed to generate attendance report: ${error.message}`);
    }
  }

  /**
   * Get attendance image by ID
   */
  async getAttendanceImage(attendanceId: string) {
    try {
      const attendance = await Attendance.findById(attendanceId)
        .select("clockIn.image")
        .lean();

      if (!attendance || !attendance.clockIn?.image?.data) {
        throw new ApiError(404, "Image not found");
      }

      return {
        data: attendance.clockIn.image.data.buffer,
        contentType: attendance.clockIn.image.contentType,
      };
    } catch (error: any) {
      logger.error(
        { error: error.message, attendanceId },
        "Failed to get attendance image"
      );
      throw new ApiError(500, "Failed to get attendance image");
    }
  }
}

export const attendanceService = new AttendanceService();

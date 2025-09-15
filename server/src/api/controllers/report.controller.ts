import type { Request, Response } from "express";
import { attendanceService } from "@/api/services/attendance.service";
import { asyncHandler, sendResponse } from "@/utils";
import { HTTP_STATUS_CODE } from "@/utils/constant";
import { env } from "@/config";

declare global {
  namespace Express {
    interface Request {
      protocol: string;
      get: (header: string) => string | undefined;
    }
  }
}

interface AttendanceReportRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  storeId: {
    _id: string;
    name: string;
    address: string;
    geofenceRadius: number;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  status: "ACTIVE" | "COMPLETED";
  isWithinGeofence: boolean;
  clockIn: {
    time: Date;
    location: {
      type: string;
      coordinates: [number, number];
    };
    image: string | null;
  };
  clockOut?: {
    time: Date;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const reportController = {
  /**
   * Generate attendance report
   */
  generateAttendanceReport: asyncHandler(
    async (req: Request, res: Response) => {
      const { userId, storeId, startDate, endDate, status } = req.query;
      const format = req.query.format === "csv" ? "csv" : "json";

      // Generate the report with detailed attendance information
      const report = await attendanceService.generateReport({
        userId: userId as string | undefined,
        storeId: storeId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as "ACTIVE" | "COMPLETED" | undefined,
      });

      // Ensure report is an array before mapping
      const reportData = Array.isArray(report) ? report : [];

      // Create maps to store unique entities
      const users = new Map<string, any>();
      const stores = new Map<string, any>();
      const brands = new Map<string, any>();
      const locations = new Map<string, any>();

      // Process the report data to extract and normalize entities
      const normalizedReport = reportData.map((record) => {
        // Store user if not already in the map
        if (!users.has(record.userId._id.toString())) {
          users.set(record.userId._id.toString(), {
            id: record.userId._id,
            name: record.userId.name,
            email: record.userId.email,
          });
        }

        // Store store if not already in the map
        const storeId = record.storeId._id.toString();
        if (!stores.has(storeId)) {
          stores.set(storeId, {
            id: record.storeId._id,
            name: record.storeId.name,
            address: record.storeId.address,
            geofenceRadius: record.storeId.geofenceRadius,
            location: record.storeId.location,
            brandId: record.brand?._id?.toString(),
            locationId: record.location?._id?.toString(),
          });
        }

        // Store brand if exists and not already in the map
        if (record.brand?._id) {
          const brandId = record.brand._id.toString();
          if (!brands.has(brandId)) {
            brands.set(brandId, {
              id: record.brand._id,
              name: record.brand.name,
              description: record.brand.description,
              logo: record.brand.logo,
            });
          }
        }

        // Store location if exists and not already in the map
        if (record.location?._id) {
          const locId = record.location._id.toString();
          if (!locations.has(locId)) {
            locations.set(locId, {
              id: record.location._id,
              name: record.location.name,
              address: record.location.address,
              city: record.location.city,
              state: record.location.state,
              country: record.location.country,
              postalCode: record.location.postalCode,
              coordinates: record.location.coordinates,
            });
          }
        }

        // Format duration
        const durationInMinutes = record.duration || 0;
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = (durationInMinutes % 60).toFixed(2);
        const formattedDuration = `${hours}h ${minutes}m`;

        // Create the attendance record with user and store details
        return {
          id: record._id,
          // User details
          user: {
            id: record.userId?._id?.toString() || "N/A",
            name: record.userId
              ? `${record.userId.firstName || ""} ${
                  record.userId.lastName || ""
                }`.trim()
              : "N/A",
            email: record.userId?.email || "N/A",
          },
          // Store details
          store: {
            id: storeId,
            brand: record.brand?.name || "N/A",
            location: record.location?.name || "N/A",
            address: record.location?.address || "N/A",
            city: record.location?.city || "N/A",
            state: record.location?.state || "N/A",
            country: record.location?.country || "N/A",
          },
          // Attendance details
          status: record.status,
          isWithinGeofence: record.isWithinGeofence ? "Yes" : "No",
          clockIn: {
            time: record.clockIn.time,
            location: record.clockIn.location,
            image: record.clockIn.image
              ? `${env.BASE_URL}/api/attendance/image/${record._id}`
              : null,
          },
          clockOut: record.clockOut
            ? {
                time: record.clockOut.time,
                location: record.clockOut.location,
              }
            : null,
          duration: formattedDuration,
          locationStatus: record.isWithinGeofence
            ? "Within Geofence"
            : "Outside Geofence",
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      });

      // Convert maps to arrays of values
      const response = {
        data: normalizedReport,
        included: {
          users: Array.from(users.values()),
          stores: Array.from(stores.values()),
          brands: Array.from(brands.values()),
          locations: Array.from(locations.values()),
        },
      };

      // Format response based on requested format
      if (format === "csv") {
        // Convert to CSV format if requested
        const csv = convertToCSV(normalizedReport);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=attendance-report.csv"
        );
        return res.send(csv);
      }

      // Default to JSON response
      return sendResponse({
        res,
        status: HTTP_STATUS_CODE.OK,
        message: "Attendance report generated successfully",
        data: response,
      });
    }
  ),
};

/**
 * Convert report data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  // Get headers from the first object
  const headers = Object.keys(flattenObject(data[0]));

  // Create CSV header
  let csv = headers.join(",") + "\n";

  // Add rows
  data.forEach((item) => {
    const flatItem = flattenObject(item);
    const row = headers.map((header) => {
      // Escape and quote fields containing commas, quotes, or newlines
      const value = flatItem[header] !== undefined ? flatItem[header] : "";
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csv += row.join(",") + "\n";
  });

  return csv;
}

/**
 * Flatten nested objects for CSV conversion
 */
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
    const pre = prefix.length ? prefix + "." : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !(obj[k] instanceof Date)
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

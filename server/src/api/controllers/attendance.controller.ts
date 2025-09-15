import type { Request, Response } from "express";
import { attendanceService } from "@/api/services/attendance.service";
import { asyncHandler, sendResponse } from "@/utils";
import { HTTP_STATUS_CODE } from "@/utils/constant";

export const attendanceController = {
  clockIn: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { storeId, latitude, longitude } = req.body;

    // Process uploaded file if exists
    const image = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : undefined;

    const attendance = await attendanceService.clockIn({
      userId,
      storeId,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      image,
    });

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Successfully clocked in",
      data: attendance,
    });
  }),

  clockOut: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { latitude, longitude } = req.body;

    const attendance = await attendanceService.clockOut({
      userId,
      location: {
        latitude,
        longitude,
      },
    });

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Successfully clocked out",
      data: attendance,
    });
  }),

  getAttendance: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    const attendance = await attendanceService.getUserAttendance(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Successfully retrieved attendance records",
      data: attendance,
    });
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const status = await attendanceService.getStatus(userId);

    sendResponse({
      res,
      status: HTTP_STATUS_CODE.OK,
      message: "Successfully retrieved clock-in status",
      data: status,
    });
  }),

  getAttendanceImage: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const { data, contentType } = await attendanceService.getAttendanceImage(id);
      
      // Set the content type and send the image data
      res.set('Content-Type', contentType);
      res.send(data);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.status(500).json({ message: 'Failed to retrieve image' });
    }
  }),
};

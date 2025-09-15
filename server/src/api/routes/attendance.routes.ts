import { Router } from "express";
import { attendanceController } from "@/api/controllers/attendance.controller";
import { reportController } from "@/api/controllers/report.controller";
import { validate } from "@/api/middleware";
import {
  clockInSchema,
  clockOutSchema,
  getAttendanceSchema,
} from "@/api/schemas/attendance.schema";
import { attendanceReportSchema } from "@/api/schemas/report.schema";
import { authGuard } from "@/api/middleware/auth";
import { uploadSingleImage } from "@/utils/fileUpload";

const router = Router();

// Image serving route
router.get("/image/:id", attendanceController.getAttendanceImage);

router.use(authGuard);

// Use multer middleware for file upload
router.post(
  "/clock-in",
  uploadSingleImage("image"),
  validate(clockInSchema),
  attendanceController.clockIn
);
router.post(
  "/clock-out",
  validate(clockOutSchema),
  attendanceController.clockOut
);
router.get(
  "/",
  validate(getAttendanceSchema),
  attendanceController.getAttendance
);

router.get("/status", attendanceController.getStatus);

// Report routes
router.get("/report", reportController.generateAttendanceReport);

export default router;

import {Router} from "express";
import authRoutes from "./auth.routes";
import attendanceRoutes from "./attendance.routes";
import storeRoutes from "./store.routes";
import userRoutes from "./user.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/attendance", attendanceRoutes);
routes.use("/stores", storeRoutes);
routes.use("/users", userRoutes);

/**
 * @route GET /health
 * @description Health check endpoint
 * @returns {Object} 200 - Server status and timestamp
 */
routes.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is running",
  });
});

export default routes;

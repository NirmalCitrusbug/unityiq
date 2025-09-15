import { Router } from "express";
import { storeController } from "@/api/controllers/store.controller";
import { validate } from "@/api/middleware";
import {
  updateStoreLocationSchema,
  getStoresSchema,
  getStoreByIdSchema,
} from "@/api/schemas/store.schema";
import { authGuard } from "@/api/middleware/auth";

const router = Router();

router.use(authGuard); // Protect all store routes

// Get all stores
router.get("/", validate(getStoresSchema), storeController.getAll);

// Get store by ID
router.get(
  "/:storeId",
  validate(getStoreByIdSchema),
  storeController.getById
);

router.patch(
  "/:storeId/location",
  validate(updateStoreLocationSchema),
  storeController.updateLocation
);

export default router;

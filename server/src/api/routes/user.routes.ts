import { Router } from "express";
import { userController } from "@/api/controllers/user.controller";
import { validate } from "@/api/middleware";
import { getUsersSchema } from "@/api/schemas/user.schema";
import { authGuard } from "@/api/middleware/auth";

const router = Router();

router.use(authGuard); // Protect all user routes

// Get list of users
router.get("/", userController.getUsers);

export default router;

import {Router} from "express";
import {authController} from "@/api/controllers/auth.controller";
import {validate} from "@/api/middleware";
import {loginSchema} from "@/api/schemas/auth.schema";
import {authGuard} from "@/api/middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authGuard, authController.logout);

export default router;

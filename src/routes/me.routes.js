import { Router } from "express";
import { meController } from "../controllers/me.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const meRoutes = Router();

meRoutes.get("/me", requireAuth, meController.getMe);

export default meRoutes;

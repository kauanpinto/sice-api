import { Router } from "express";
import rateLimit from "express-rate-limit";
import { settingsController } from "../controllers/settings.controller.js";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware.js";

const settingsRoutes = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

settingsRoutes.get(
  "/devices/:id/settings",
  requireAuth,
  requireOwner,
  settingsController.getSettings,
);
settingsRoutes.put(
  "/devices/:id/settings",
  requireAuth,
  requireOwner,
  limiter,
  settingsController.updateSettings,
);

export default settingsRoutes;

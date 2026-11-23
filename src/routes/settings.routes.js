import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware.js";

const settingsRoutes = Router();

settingsRoutes.get(
  "/devices/:id/settings",
  requireAuth,
  requireOwner,
  settingsController.getSettings,
);
settingsRoutes.patch(
  "/devices/:id/settings",
  requireAuth,
  requireOwner,
  settingsController.updateSettings,
);

export default settingsRoutes;

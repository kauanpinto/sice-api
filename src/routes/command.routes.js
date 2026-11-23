import { Router } from "express";
import { commandController } from "../controllers/command.controller.js";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware.js";

const commandRoutes = Router();

commandRoutes.post(
  "/devices/:id/command",
  requireAuth,
  requireOwner,
  commandController.sendCommand,
);

export default commandRoutes;

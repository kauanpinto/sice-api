import { Router } from "express";
import { alertsController } from "../controllers/alerts.controller.js";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware.js";

const alertsRoutes = Router();

alertsRoutes.post(
  "/devices/:id/alerts/:rule/ack",
  requireAuth,
  requireOwner,
  alertsController.ackAlert,
);

export default alertsRoutes;

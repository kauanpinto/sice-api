import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pushTokensController } from "../controllers/push-tokens.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const pushTokensRoutes = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

pushTokensRoutes.put(
  "/me/push-tokens",
  requireAuth,
  limiter,
  pushTokensController.saveToken,
);
pushTokensRoutes.delete(
  "/me/push-tokens",
  requireAuth,
  limiter,
  pushTokensController.removeToken,
);

export default pushTokensRoutes;

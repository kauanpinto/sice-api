import cors from "cors";
import helmet from "helmet";
import express from "express";
import rateLimit from "express-rate-limit";
import meRoutes from "./routes/me.routes.js";
import commandRoutes from "./routes/command.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import pushTokensRoutes from "./routes/push-token.routes.js";
import { env } from "./config/env.js";
import { AppError } from "./utils/errors.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.use(express.json({ limit: "10kb" }));

  app.use(settingsRoutes);
  app.use(meRoutes);
  app.use(pushTokensRoutes);
  app.use(commandRoutes);

  app.use((_req, _res, next) => {
    next(new AppError(404, "not_found"));
  });

  app.use(errorHandler);

  return app;
}

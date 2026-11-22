import { AppError } from "../utils/errors.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.code });
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "validation_error" });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "payload_too_large" });
  }

  console.error(err);
  return res.status(500).json({ error: "internal_error" });
}

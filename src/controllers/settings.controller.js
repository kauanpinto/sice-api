import { AppError } from "../utils/errors.js";
import { settingsSchema } from "../schemas/settings.schema.js";
import { settingsService } from "../services/settings.service.js";

async function getSettings(req, res) {
  const data = await settingsService.getSettings(req.params.id);
  
  return res.status(200).json(data);
}

async function updateSettings(req, res) {
  const parsed = settingsSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "validation_error");
  }

  if (Object.keys(parsed.data).length === 0) {
    throw new AppError(400, "validation_error");
  }

  const data = await settingsService.updateSettings(req.params.id, parsed.data);

  return res.status(200).json(data);
}

export const settingsController = {
  getSettings,
  updateSettings,
};

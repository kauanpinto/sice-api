import { AppError } from "../utils/errors.js";
import { settingsSchema } from "../schemas/settings.schema.js";
import { settingsService } from "../services/settings.service.js";

function toFields(error) {
  const fields = {};

  for (const issue of error.issues) {
    fields[issue.path.join(".")] = issue.message;
  }

  return fields;
}

async function getSettings(req, res) {
  const data = await settingsService.getSettings(req.params.id);

  return res.status(200).json(data);
}

async function updateSettings(req, res) {
  const parsed = settingsSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "validation_error", toFields(parsed.error));
  }

  await settingsService.updateSettings(req.params.id, parsed.data);

  return res.status(204).send();
}

export const settingsController = {
  getSettings,
  updateSettings,
};

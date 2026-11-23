import { AppError } from "../utils/errors.js";
import { settingsRepository } from "../repositories/settings.repository.js";

async function getSettings(deviceId) {
  const settings = await settingsRepository.getSettings(deviceId);

  if (!settings) {
    throw new AppError(404, "not_found");
  }

  return settings;
}

async function updateSettings(deviceId, data) {
  await settingsRepository.updateSettings(deviceId, data);
  
  return await getSettings(deviceId);
}

export const settingsService = {
  getSettings,
  updateSettings,
};

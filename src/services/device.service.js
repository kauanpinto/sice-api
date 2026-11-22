import { env } from "../config/env.js";
import { deviceRepository } from "../repositories/device.repository.js";
import { AppError } from "../utils/errors.js";

async function ensureDeviceReady() {
  const ownerUid = await deviceRepository.getOwnerUid(env.DEVICE_ID);

  if (!ownerUid) {
    throw new AppError(404, "not_found");
  }

  const defaults = {
    name: "esp32-001",
    timezone: "America/Bahia",
    voltageV: 127,
    onCurrentA: 0.1,
    lightThreshold: 2048,
    darkWhen: "high",
    schedule: { mode: "window", start: "22:00", end: "06:00" },
    alerts: {
      absence: true,
      dark: true,
      outsideSchedule: true,
      highUsage: true,
    },
    graceMinutes: 10,
    reminderMinutes: 30,
    highUsageKwhDay: 5,
  };

  await deviceRepository.seedSettingsIfMissing(env.DEVICE_ID, defaults);
}

export const deviceService = {
  ensureDeviceReady,
};

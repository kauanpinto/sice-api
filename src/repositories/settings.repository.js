import { db } from "../infra/firebase.js";

async function getSettings(deviceId) {
  const snapshot = await db.ref(`devices/${deviceId}/settings`).get();

  return snapshot.exists() ? snapshot.val() : null;
}

async function updateSettings(deviceId, data) {
  await db.ref(`devices/${deviceId}/settings`).update(data);
}

export const settingsRepository = {
  getSettings,
  updateSettings,
};

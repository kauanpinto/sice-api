import { db } from "../infra/firebase.js";

async function getDevice(deviceId) {
  const snapshot = await db.ref(`devices/${deviceId}`).get();

  return snapshot.exists() ? snapshot.val() : null;
}

async function getOwnerUid(deviceId) {
  const snapshot = await db.ref(`devices/${deviceId}/ownerUid`).get();

  return snapshot.val() ?? null;
}

async function seedSettingsIfMissing(deviceId, defaults) {
  const result = await db
    .ref(`devices/${deviceId}/settings`)
    .transaction((current) => current ?? defaults);

  return result.snapshot.val();
}

async function removeLegacySettings(deviceId) {
  await db.ref(`devices/${deviceId}/settings`).update({
    timezone: null,
    onCurrentA: null,
    lightThreshold: null,
    darkWhen: null,
  });
}

export const deviceRepository = {
  getDevice,
  getOwnerUid,
  seedSettingsIfMissing,
  removeLegacySettings,
};

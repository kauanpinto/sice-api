import { db } from "../infra/firebase.js";

async function updateControl(deviceId, updaterFn) {
  const { snapshot } = await db
    .ref(`devices/${deviceId}/control`)
    .transaction((current) => updaterFn(current ?? {}));

  return snapshot.val();
}

async function getControl(deviceId) {
  const snap = await db.ref(`devices/${deviceId}/control`).get();

  return snap.exists() ? snap.val() : null;
}

export const controlRepository = {
  updateControl,
  getControl,
};

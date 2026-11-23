import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { deriveStatus } from "../services/status.service.js";
import { every } from "../utils/loop.js";

let prevStatus = null;

async function runStatus() {
  const deviceId = env.DEVICE_ID;
  const [readSnap, settingsSnap, controlSnap, statusSnap] = await Promise.all([
    db.ref(`devices/${deviceId}/readings`).orderByKey().limitToLast(1).get(),
    db.ref(`devices/${deviceId}/settings`).get(),
    db.ref(`devices/${deviceId}/control`).get(),
    db.ref(`devices/${deviceId}/status`).get(),
  ]);
  const settings = settingsSnap.val();

  if (!settings) return;

  const readings = readSnap.val();
  const reading = readings ? Object.values(readings)[0] : null;

  prevStatus = statusSnap.val() ?? prevStatus;

  const status = deriveStatus({
    reading,
    settings,
    control: controlSnap.val(),
    prevStatus,
    now: Date.now(),
  });

  prevStatus = status;

  await db.ref(`devices/${deviceId}/status`).set(status);
}

export function startStatusJob() {
  every(10_000, runStatus);
}

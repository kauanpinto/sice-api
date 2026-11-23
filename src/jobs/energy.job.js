import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { computeWh } from "../services/energy.service.js";
import { localParts } from "../utils/time.js";
import { every } from "../utils/loop.js";

const HOUR = 3_600_000;
const BACKFILL_HOURS = 48;
const REFRESH_HOURS = 2;
const KEEP_MS = 48 * HOUR;

let hours = BACKFILL_HOURS;

async function recomputeHours(deviceId, settings, count) {
  const to = Date.now();
  const from = Math.floor((to - count * HOUR) / HOUR) * HOUR;

  const snap = await db
    .ref(`devices/${deviceId}/readings`)
    .orderByChild("measuredAt")
    .startAt(from - 60_000)
    .endAt(to)
    .get();
  const readings = snap.exists() ? Object.values(snap.val()) : [];
  const updates = {};

  for (let start = from; start < to; start += HOUR) {
    const end = start + HOUR;
    const slice = readings.filter(
      (r) => r.measuredAt >= start - 60_000 && r.measuredAt <= end,
    );
    const { day, hour } = localParts(start);

    updates[`devices/${deviceId}/energy/hourly/${day}/${hour}`] = computeWh(
      slice,
      start,
      end,
      settings,
    );
  }

  await db.ref().update(updates);
}

async function cleanupOldReadings(deviceId) {
  const old = await db
    .ref(`devices/${deviceId}/readings`)
    .orderByChild("measuredAt")
    .endAt(Date.now() - KEEP_MS)
    .limitToFirst(500)
    .get();

  if (!old.exists()) return;

  const updates = {};

  for (const key of Object.keys(old.val())) {
    updates[`devices/${deviceId}/readings/${key}`] = null;
  }

  await db.ref().update(updates);
}

async function runEnergy() {
  const deviceId = env.DEVICE_ID;
  const settings = (await db.ref(`devices/${deviceId}/settings`).get()).val();

  if (!settings) return;

  await recomputeHours(deviceId, settings, hours);
  hours = REFRESH_HOURS;
  await cleanupOldReadings(deviceId);
}

export function startEnergyJob() {
  every(60_000, runEnergy);
}

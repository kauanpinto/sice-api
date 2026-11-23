import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { localParts } from "../utils/time.js";
import { every } from "../utils/loop.js";

async function runCost() {
  const deviceId = env.DEVICE_ID;
  const { month, dayOfMonth } = localParts(Date.now());
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  const tariffSnap = await db.ref(`devices/${deviceId}/tariff/current`).get();
  const tariff = tariffSnap.exists()
    ? tariffSnap.val().finalBRLkWh
    : env.TARIFF_FALLBACK_BRL_KWH;

  const snap = await db
    .ref(`devices/${deviceId}/energy/hourly`)
    .orderByKey()
    .startAt(`${month}-01`)
    .endAt(`${month}-31`)
    .get();

  let wh = 0;

  if (snap.exists()) {
    for (const hoursOfDay of Object.values(snap.val())) {
      wh += Object.values(hoursOfDay).reduce((a, b) => a + (b ?? 0), 0);
    }
  }

  const kwh = wh / 1000;
  const costBRL = Math.round(kwh * tariff * 100) / 100;
  const projectedBRL =
    dayOfMonth > 1
      ? Math.round((kwh / dayOfMonth) * daysInMonth * tariff * 100) / 100
      : null;

  await db.ref(`devices/${deviceId}/cost/${month}`).set({
    kwh: Math.round(kwh * 1000) / 1000,
    tariffBRL: tariff,
    costBRL,
    projectedBRL,
    updatedAt: Date.now(),
  });
}

export function startCostJob() {
  every(60_000, runCost);
}

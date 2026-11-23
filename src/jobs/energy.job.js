import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { computeWh } from "../services/energy.service.js";

function hourKey(date, tz) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;

  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    hour: get("hour"),
  };
}

export function startEnergyJob() {
  async function tick() {
    try {
      const deviceId = env.DEVICE_ID;
      const settings = (
        await db.ref(`devices/${deviceId}/settings`).get()
      ).val();

      if (!settings) return;

      const now = new Date();

      for (const offset of [0, 1]) {
        const target = new Date(now.getTime() - offset * 3600000);
        const { day, hour } = hourKey(target, settings.timezone);
        const start = new Date(target);

        start.setMinutes(0, 0, 0);

        const end = new Date(start.getTime() + 3600000);
        const snap = await db
          .ref(`devices/${deviceId}/readings`)
          .orderByChild("measuredAt")
          .startAt(start.getTime() - 60000)
          .endAt(end.getTime())
          .get();
        const readings = snap.exists() ? Object.values(snap.val()) : [];
        const wh = computeWh(
          readings,
          start.getTime(),
          end.getTime(),
          settings,
        );

        await db
          .ref(`devices/${deviceId}/energy/hourly/${day}/${hour}`)
          .set(wh);
      }

      const cutoff = Date.now() - 48 * 3600000;
      const old = await db
        .ref(`devices/${deviceId}/readings`)
        .orderByChild("measuredAt")
        .endAt(cutoff)
        .limitToFirst(500)
        .get();

      if (old.exists()) {
        const updates = {};

        for (const k of Object.keys(old.val())) {
          updates[`devices/${deviceId}/readings/${k}`] = null;
        }

        await db.ref().update(updates);
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(tick, 60000);
  }
  tick();
}

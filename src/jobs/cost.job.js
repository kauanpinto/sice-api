import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";

export function startCostJob() {
  async function tick() {
    try {
      const deviceId = env.DEVICE_ID;
      const settings = (
        await db.ref(`devices/${deviceId}/settings`).get()
      ).val();

      if (!settings) return;

      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const tariffSnap = await db
        .ref(`devices/${deviceId}/tariff/current`)
        .get();
      const tariff = tariffSnap.exists()
        ? tariffSnap.val().finalBRLkWh
        : env.TARIFF_FALLBACK_BRL_KWH;

      let kwh = 0;

      for (let d = 1; d <= now.getDate(); d++) {
        const day = `${month}-${String(d).padStart(2, "0")}`;
        const snap = await db
          .ref(`devices/${deviceId}/energy/hourly/${day}`)
          .get();

        if (snap.exists()) {
          kwh += Object.values(snap.val()).reduce((a, b) => a + b, 0) / 1000;
        }
      }
      
      const costBRL = Math.round(kwh * tariff * 100) / 100;
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const projectedBRL =
        now.getDate() > 0
          ? Math.round((costBRL / now.getDate()) * daysInMonth * 100) / 100
          : null;

      await db
        .ref(`devices/${deviceId}/cost/${month}`)
        .set({
          kwh: Math.round(kwh * 1000) / 1000,
          tariffBRL: tariff,
          costBRL,
          projectedBRL,
          updatedAt: Date.now(),
        });
    } catch (err) {
      console.error(err);
    }

    setTimeout(tick, 60000);
  }
  tick();
}

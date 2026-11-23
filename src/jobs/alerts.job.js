import { db } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { evaluateRules } from "../services/status.service.js";
import { pushTokensRepository } from "../repositories/push-tokens.repository.js";
import { messaging } from "../infra/firebase.js";
import { alertMessages } from "../utils/alert-messages.js";

export function startAlertsJob() {
  async function tick() {
    try {
      const deviceId = env.DEVICE_ID;
      const [statusSnap, settingsSnap, ownerSnap] = await Promise.all([
        db.ref(`devices/${deviceId}/status`).get(),
        db.ref(`devices/${deviceId}/settings`).get(),
        db.ref(`devices/${deviceId}/ownerUid`).get(),
      ]);
      const status = statusSnap.val();
      const settings = settingsSnap.val();
      const ownerUid = ownerSnap.val();

      if (!status || !settings || !ownerUid) return;

      const today = new Date().toISOString().slice(0, 10);
      const energySnap = await db
        .ref(`devices/${deviceId}/energy/hourly/${today}`)
        .get();
      const todayKwh = energySnap.exists()
        ? Object.values(energySnap.val()).reduce((a, b) => a + b, 0) / 1000
        : 0;
      const results = evaluateRules({
        status,
        settings,
        todayKwh,
        nowMs: Date.now(),
      });

      for (const [rule, value] of Object.entries(results)) {
        const ref = db.ref(`devices/${deviceId}/alerts/${rule}`);
        const current = (await ref.get()).val();

        if (value === null || value === false) {
          if (current) await ref.remove();
          continue;
        }

        if (!current) {
          await ref.set({
            state: "pending",
            since: Date.now(),
            episodeId: `${rule}_${Date.now()}`,
            acknowledged: false,
            lastNotifiedAt: null,
            notifiedCount: 0,
          });
          
          continue;
        }

        if (
          current.state === "pending" &&
          Date.now() - current.since >= settings.graceMinutes * 60000
        ) {
          await ref.update({ state: "alert" });

          const tokens = await pushTokensRepository.getTokens(ownerUid);

          if (tokens.length === 0) continue;

          const claimRef = db.ref(
            `devices/${deviceId}/notifications/${current.episodeId}_1`,
          );
          const claim = await claimRef.transaction((c) =>
            c
              ? undefined
              : { status: "sending", attempts: 1, updatedAt: Date.now() },
          );

          if (!claim.committed) continue;

          try {
            await messaging.sendEachForMulticast({
              tokens,
              notification: {
                title: "SICE - Alerta",
                body: alertMessages[rule],
              },
              webpush: {
                notification: { tag: current.episodeId },
                fcmOptions: { link: process.env.DASHBOARD_URL },
                headers: { TTL: "900" },
              },
            });
            await claimRef.update({ status: "sent" });
            await ref.update({ lastNotifiedAt: Date.now(), notifiedCount: 1 });
          } catch {
            await claimRef.update({ status: "failed" });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(tick, 10000);
  }
  tick();
}

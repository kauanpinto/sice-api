import { db, messaging } from "../infra/firebase.js";
import { env } from "../config/env.js";
import { evaluateRules } from "../services/status.service.js";
import { pushTokensRepository } from "../repositories/push-tokens.repository.js";
import { alertMessages } from "../utils/alert-messages.js";
import { localParts } from "../utils/time.js";
import { every } from "../utils/loop.js";

async function sendFirstNotification({
  deviceId,
  ownerUid,
  rule,
  ref,
  current,
}) {
  const tokens = await pushTokensRepository.getTokens(ownerUid);

  if (tokens.length === 0) return;

  const claimRef = db.ref(
    `devices/${deviceId}/notifications/${current.episodeId}_1`,
  );
  const claim = await claimRef.transaction((c) =>
    c ? undefined : { status: "sending", attempts: 1, updatedAt: Date.now() },
  );

  if (!claim.committed) return;

  try {
    await messaging.sendEachForMulticast({
      tokens,
      notification: { title: "SICE - Alerta", body: alertMessages[rule] },
      webpush: {
        notification: { tag: current.episodeId },
        ...(env.DASHBOARD_URL && { fcmOptions: { link: env.DASHBOARD_URL } }),
        headers: { TTL: "900" },
      },
    });
    await claimRef.update({ status: "sent" });
    await ref.update({ lastNotifiedAt: Date.now(), notifiedCount: 1 });
  } catch (err) {
    console.error(err);
    await claimRef.update({ status: "failed" });
  }
}

async function runAlerts() {
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

  const today = localParts(Date.now()).day;
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
    if (value === null) continue;

    const ref = db.ref(`devices/${deviceId}/alerts/${rule}`);
    const current = (await ref.get()).val();

    if (value === false) {
      if (current) await ref.remove();
      continue;
    }

    if (!current) {
      const now = Date.now();

      await ref.set({
        state: "pending",
        since: now,
        episodeId: `${rule}_${now}`,
        acknowledged: false,
        lastNotifiedAt: null,
        notifiedCount: 0,
      });
      continue;
    }

    const graceMs = settings.graceMinutes * 60_000;

    if (current.state === "pending" && Date.now() - current.since >= graceMs) {
      await ref.update({ state: "alert" });
      await sendFirstNotification({ deviceId, ownerUid, rule, ref, current });
    }
  }
}

export function startAlertsJob() {
  every(10_000, runAlerts);
}

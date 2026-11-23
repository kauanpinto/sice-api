import { ON_CURRENT_A, ON_HYSTERESIS } from "../config/device-rules.js";
import { isWithinSchedule } from "../utils/time.js";

function commandState(control) {
  const requested = control?.requestedState ?? false;
  const confirmed = control?.relayState ?? false;

  return { requested, confirmed, pending: requested !== confirmed };
}

export function deriveStatus({ reading, settings, control, prevStatus, now }) {
  const online = Boolean(reading) && now - reading.measuredAt < 60_000;

  if (!online) {
    return {
      online: false,
      lastSeenAt: reading?.measuredAt ?? null,
      equipment: "unknown",
      presence: "unknown",
      ambient: "unknown",
      powerW: 0,
      command: commandState(control),
      updatedAt: now,
    };
  }

  const wasOn = prevStatus?.equipment === "on";
  const equipment =
    reading.currentA >= ON_CURRENT_A ||
    (wasOn && reading.currentA >= ON_CURRENT_A * ON_HYSTERESIS)
      ? "on"
      : "off";

  return {
    online: true,
    lastSeenAt: reading.measuredAt,
    equipment,
    presence: reading.presence ? "detected" : "not_detected",
    ambient: reading.lightRaw === 1 ? "dark" : "bright",
    powerW: Math.round(reading.currentA * settings.voltageV * 10) / 10,
    command: commandState(control),
    updatedAt: now,
  };
}

export function evaluateRules({ status, settings, todayKwh, nowMs }) {
  if (!status.online) {
    return {
      absence: null,
      dark: null,
      outsideSchedule: null,
      highUsage: null,
    };
  }

  const inSchedule = isWithinSchedule(settings, nowMs);
  const isWindow = settings.schedule.mode === "window";

  return {
    absence: !settings.alerts.absence
      ? false
      : isWindow &&
        inSchedule &&
        status.equipment === "on" &&
        status.presence === "not_detected",
    dark: !settings.alerts.dark
      ? false
      : isWindow &&
        inSchedule &&
        status.equipment === "on" &&
        status.ambient === "dark",
    outsideSchedule: !settings.alerts.outsideSchedule
      ? false
      : isWindow && !inSchedule && status.equipment === "on",
    highUsage: !settings.alerts.highUsage
      ? false
      : todayKwh > settings.highUsageKwhDay,
  };
}

export function deriveStatus({ reading, settings, control, prevStatus, now }) {
  const online = reading && now - reading.measuredAt < 60000;

  if (!online) {
    return {
      online: false,
      lastSeenAt: reading?.measuredAt ?? null,
      equipment: "unknown",
      presence: "unknown",
      ambient: "unknown",
      powerW: 0,
      command: {
        requested: control?.requestedState ?? false,
        confirmed: control?.relayState ?? false,
        pending:
          (control?.requestedState ?? false) !== (control?.relayState ?? false),
      },
      updatedAt: now,
    };
  }

  const onThreshold = settings.onCurrentA;
  const wasOn = prevStatus?.equipment === "on";
  const equipment =
    reading.currentA >= onThreshold
      ? "on"
      : wasOn && reading.currentA >= onThreshold * 0.8
        ? "on"
        : "off";
  const presence = reading.presence ? "detected" : "not_detected";
  const isDark =
    settings.darkWhen === "high"
      ? reading.lightRaw >= settings.lightThreshold
      : reading.lightRaw <= settings.lightThreshold;
  const ambient = isDark ? "dark" : "bright";

  return {
    online: true,
    lastSeenAt: reading.measuredAt,
    equipment,
    presence,
    ambient,
    powerW: reading.currentA * settings.voltageV,
    command: {
      requested: control?.requestedState ?? false,
      confirmed: control?.relayState ?? false,
      pending:
        (control?.requestedState ?? false) !== (control?.relayState ?? false),
    },
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

export function isWithinSchedule(settings, nowMs) {
  if (settings.schedule.mode === "always") return true;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: settings.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(nowMs));
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  const nowMin = hour * 60 + minute;
  const [sh, sm] = settings.schedule.start.split(":").map(Number);
  const [eh, em] = settings.schedule.end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (start <= end) {
    return nowMin >= start && nowMin < end;
  }

  return nowMin >= start || nowMin < end;
}

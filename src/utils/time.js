import { TIMEZONE } from "../config/device-rules.js";

const dayHourFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

const minuteFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function localParts(ms) {
  const p = Object.fromEntries(
    dayHourFormatter
      .formatToParts(new Date(ms))
      .map(({ type, value }) => [type, value]),
  );

  return {
    day: `${p.year}-${p.month}-${p.day}`,
    month: `${p.year}-${p.month}`,
    hour: p.hour,
    dayOfMonth: Number(p.day),
  };
}

export function isWithinSchedule(settings, nowMs) {
  if (settings.schedule.mode === "always") return true;

  const parts = minuteFormatter.formatToParts(new Date(nowMs));
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  const nowMin = hour * 60 + minute;
  const [sh, sm] = settings.schedule.start.split(":").map(Number);
  const [eh, em] = settings.schedule.end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  if (start <= end) return nowMin >= start && nowMin < end;

  return nowMin >= start || nowMin < end;
}

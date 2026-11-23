export function computeWh(readings, startMs, endMs, settings) {
  const sorted = [...readings].sort((a, b) => a.measuredAt - b.measuredAt);
  const seen = new Set();
  const uniq = sorted.filter((r) => {
    if (seen.has(r.measuredAt)) return false;

    seen.add(r.measuredAt);

    return true;
  });

  let wh = 0;

  for (let i = 0; i < uniq.length; i++) {
    const cur = uniq[i];
    const next = uniq[i + 1];
    const segStart = Math.max(cur.measuredAt, startMs);
    const segEnd = Math.min(
      next ? next.measuredAt : endMs,
      endMs,
      cur.measuredAt + 60000,
    );

    if (segEnd <= segStart) continue;

    if (cur.currentA < settings.onCurrentA) continue;

    wh +=
      (cur.currentA * settings.voltageV * (segEnd - segStart)) / 1000 / 3600;
  }

  return Math.round(wh * 100) / 100;
}

import { z } from "zod";

function isValidTimezone(v) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: v });
    return true;
  } catch {
    return false;
  }
}

export const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    timezone: z.string().refine(isValidTimezone),
    voltageV: z.number().min(100).max(240),
    onCurrentA: z.number().min(0.05).max(30),
    lightThreshold: z.number().int().min(0).max(4095),
    darkWhen: z.enum(["low", "high"]),
    schedule: z
      .object({
        mode: z.enum(["always", "window"]),
        start: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
        end: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional(),
      })
      .strict()
      .refine(
        (s) => {
          if (s.mode === "window") return s.start && s.end && s.start !== s.end;
          return true;
        },
        { message: "window precisa de start e end diferentes" },
      ),
    alerts: z
      .object({
        absence: z.boolean(),
        dark: z.boolean(),
        outsideSchedule: z.boolean(),
        highUsage: z.boolean(),
      })
      .strict(),
    graceMinutes: z.number().int().min(1).max(120),
    reminderMinutes: z.number().int().min(5).max(240),
    highUsageKwhDay: z.number().positive(),
  })
  .strict();

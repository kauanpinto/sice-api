import { z } from "zod";

const time = z.string().regex(/^\d{2}:\d{2}$/);

export const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    voltageV: z.number().min(100).max(240),
    schedule: z
      .object({
        mode: z.enum(["always", "window"]),
        start: time.optional(),
        end: time.optional(),
      })
      .strict()
      .refine(
        (s) => s.mode !== "window" || (s.start && s.end && s.start !== s.end),
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

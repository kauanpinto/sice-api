import { z } from "zod";

export const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(40).optional(),
    timezone: z.string().min(1).optional(),
    voltageV: z.number().positive().optional(),
    onCurrentA: z.number().positive().optional(),
    lightThreshold: z.number().int().min(0).max(4095).optional(),
    darkWhen: z.enum(["high", "low"]).optional(),
    schedule: z
      .object({
        mode: z.enum(["window", "always", "off"]).optional(),
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
      .optional(),
    alerts: z
      .object({
        absence: z.boolean().optional(),
        dark: z.boolean().optional(),
        outsideSchedule: z.boolean().optional(),
        highUsage: z.boolean().optional(),
      })
      .strict()
      .optional(),
    graceMinutes: z.number().int().min(0).max(120).optional(),
    reminderMinutes: z.number().int().min(0).max(240).optional(),
    highUsageKwhDay: z.number().positive().optional(),
  })
  .strict();

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .transform((value) => value.split(",").map((item) => item.trim())),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().trim().min(1),
  FIREBASE_DATABASE_URL: z.url(),
  DEVICE_ID: z.string().regex(/^[a-z0-9-]{3,40}$/),
});

const validatedData = envSchema.safeParse(process.env);

if (!validatedData.success) {
  console.error("Variavéis de ambiente inválidas:");
  console.error(z.treeifyError(validatedData.error));
  process.exit(1);
}

export const env = validatedData.data;

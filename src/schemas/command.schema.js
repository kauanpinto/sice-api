import { z } from "zod";

export const commandSchema = z.object({ state: z.boolean() }).strict();

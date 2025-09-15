import "dotenv/config";
import {z} from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(8000),
  BASE_URL: z.string().url(),
  MONGODB_URI: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  USE_COOKIES: z.coerce.boolean().default(true),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(true),
  MAIL_FROM: z.string().default("no-reply@example.com"),
});

export const env = EnvSchema.parse(process.env);

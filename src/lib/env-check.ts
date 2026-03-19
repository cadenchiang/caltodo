/**
 * Validates that required environment variables are present at startup.
 * Throws for truly required vars; logs warnings for optional ones.
 * Called once from the root server layout.
 */

import { logger } from "@/lib/logger";

/** Env vars that the app cannot function without. */
const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/**
 * Env var required only in production (not needed for local dev).
 * Missing in development triggers a warning instead of an error.
 */
const PRODUCTION_REQUIRED_VARS = [
  "CREDENTIALS_ENCRYPTION_KEY",
] as const;

/** Optional env vars — missing ones produce a warning, not an error. */
const OPTIONAL_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "POSTHOG_KEY",
  "ANTHROPIC_API_KEY",
] as const;

/**
 * Validates that required environment variables are set.
 * Logs warnings for optional missing vars.
 * Throws an error if any required var is missing.
 *
 * @throws Error if any required environment variable is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const name of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(name);
      logger.error("validateEnv: missing required env var", { name });
    }
  }

  const isProduction = process.env.NODE_ENV === "production";

  for (const name of PRODUCTION_REQUIRED_VARS) {
    if (!process.env[name]) {
      if (isProduction) {
        missing.push(name);
        logger.error("validateEnv: missing required env var (production)", { name });
      } else {
        logger.warn("validateEnv: missing env var (optional in dev)", { name });
      }
    }
  }

  for (const name of OPTIONAL_VARS) {
    if (!process.env[name]) {
      logger.warn("validateEnv: missing optional env var", { name });
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  logger.info("validateEnv: all required env vars present");
}

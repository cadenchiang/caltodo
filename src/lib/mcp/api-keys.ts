/**
 * Per-user MCP API key generation, storage and lookup.
 *
 * Keys are shown to the user once at creation; only their SHA-256 hash is
 * stored, so the plaintext cannot be recovered from the database. Lookup
 * hashes the presented key and reads the unique index on `key_hash`.
 *
 * @module mcp/api-keys
 */

import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { coerceScope, DEFAULT_SCOPE, type McpScope } from "@/lib/mcp/scopes";

/** Prefix on every issued key, so a leaked string is recognizable. */
export const KEY_PREFIX = "sk-caltodo-";

/** Random bytes behind each key. 32 bytes = 256 bits of entropy. */
const KEY_BYTES = 32;

/** Characters of the key kept in plaintext for display in the UI. */
const DISPLAY_PREFIX_LENGTH = KEY_PREFIX.length + 8;

/** A key's metadata, safe to return to the browser. */
export interface McpKeyRecord {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  /** When the key stops working, or null when it never expires. */
  expiresAt: string | null;
  /** What the key is allowed to do: every tool, or the read-only ones. */
  scope: McpScope;
}

/** Expiry choices offered when creating a key, in days. Null means never. */
export const EXPIRY_DAY_OPTIONS = [7, 30, 90, 365] as const;

/**
 * Generates a new random API key.
 *
 * @returns The plaintext key, e.g. "sk-caltodo-<64 hex chars>"
 * @remarks Uses crypto.randomBytes, never Math.random.
 */
export function generateApiKey(): string {
  return `${KEY_PREFIX}${randomBytes(KEY_BYTES).toString("hex")}`;
}

/**
 * Hashes a plaintext key for storage and lookup.
 *
 * @param key - Plaintext API key
 * @returns Lowercase hex SHA-256 digest
 * @remarks A plain hash with no salt is correct here: keys are 256-bit random
 *          values, so there is no dictionary to attack, and lookup requires a
 *          deterministic digest.
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

/**
 * Extracts the display-only fragment of a key.
 *
 * @param key - Plaintext API key
 * @returns The leading characters shown in the settings UI
 */
export function keyDisplayPrefix(key: string): string {
  return key.slice(0, DISPLAY_PREFIX_LENGTH);
}

/** Shape of a row selected from mcp_api_keys for the UI. */
interface KeyRow {
  id: string;
  label: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  scope: string | null;
}

/**
 * Maps a database row onto the browser-safe record.
 *
 * @param row - Row from mcp_api_keys
 * @returns Metadata with no secret material
 */
function toRecord(row: KeyRow): McpKeyRecord {
  return {
    id: row.id,
    label: row.label,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    expiresAt: row.expires_at,
    scope: coerceScope(row.scope),
  };
}

/**
 * Converts a lifetime in days into an absolute expiry.
 *
 * @param days - Whole days the key should last, or null/undefined for no expiry
 * @returns ISO timestamp, or null when the key never expires
 * @throws Error when days is not a positive whole number
 */
export function expiryFromDays(days: number | null | undefined): string | null {
  if (days === null || days === undefined) return null;
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("Key lifetime must be a whole number of days.");
  }
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

/** Longest accepted label, matching the column's practical use in the UI. */
const MAX_LABEL_LENGTH = 60;

/**
 * Creates and stores a new API key for a user.
 *
 * @param client - Supabase client authenticated as the user (RLS applies)
 * @param userId - Owner of the new key
 * @param label - Human label for the key, defaults to "Poke"
 * @param expiresInDays - Whole days until the key stops working, or null for never
 * @param scope - Access level, defaulting to full so callers that predate
 *                scopes keep their previous behaviour
 * @returns The plaintext key (shown once) plus the stored record
 * @throws Error when the label is too long or the insert is rejected
 * @remarks The plaintext is returned only here. Nothing else can recover it.
 */
export async function createApiKey(
  client: SupabaseClient,
  userId: string,
  label = "Poke",
  expiresInDays: number | null = null,
  scope: McpScope = DEFAULT_SCOPE
): Promise<{ key: string; record: McpKeyRecord }> {
  const trimmed = label.trim() || "Poke";
  if (trimmed.length > MAX_LABEL_LENGTH) {
    throw new Error(`Label is too long (max ${MAX_LABEL_LENGTH} characters).`);
  }

  const key = generateApiKey();

  const { data, error } = await client
    .from("mcp_api_keys")
    .insert({
      user_id: userId,
      key_hash: hashApiKey(key),
      key_prefix: keyDisplayPrefix(key),
      label: trimmed,
      expires_at: expiryFromDays(expiresInDays),
      scope,
    })
    .select("id, label, key_prefix, created_at, last_used_at, expires_at, scope")
    .single();

  if (error) {
    logger.error("mcp.apiKeys: create failed", {
      cause: error.message,
      userId,
      impact: "user could not generate an MCP key",
    });
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  logger.info("mcp.apiKeys: key created", {
    userId,
    keyId: (data as unknown as KeyRow).id,
    scope,
  });
  return { key, record: toRecord(data as unknown as KeyRow) };
}

/**
 * Lists a user's API keys, newest first.
 *
 * @param client - Supabase client authenticated as the user (RLS applies)
 * @param userId - Owner whose keys to list
 * @returns Key metadata, never any secret material
 * @throws Error when the query is rejected
 */
export async function listApiKeys(
  client: SupabaseClient,
  userId: string
): Promise<McpKeyRecord[]> {
  const { data, error } = await client
    .from("mcp_api_keys")
    .select("id, label, key_prefix, created_at, last_used_at, expires_at, scope")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("mcp.apiKeys: list failed", {
      cause: error.message,
      userId,
      impact: "settings could not show the user's MCP keys",
    });
    throw new Error(`Failed to list API keys: ${error.message}`);
  }

  return ((data ?? []) as unknown as KeyRow[]).map(toRecord);
}

/**
 * Renames one of a user's API keys.
 *
 * @param client - Supabase client authenticated as the user (RLS applies)
 * @param userId - Owner of the key
 * @param keyId - Id of the key to rename
 * @param label - New human label
 * @returns The updated record
 * @throws Error when the label is empty or too long, the key is not the
 *         caller's, or the write fails
 * @remarks Only the label is editable. The key itself cannot be changed or
 *          re-read, since only its hash is stored.
 */
export async function renameApiKey(
  client: SupabaseClient,
  userId: string,
  keyId: string,
  label: string
): Promise<McpKeyRecord> {
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Name cannot be empty.");
  if (trimmed.length > MAX_LABEL_LENGTH) {
    throw new Error(`Label is too long (max ${MAX_LABEL_LENGTH} characters).`);
  }

  const { data, error } = await client
    .from("mcp_api_keys")
    .update({ label: trimmed })
    .eq("user_id", userId)
    .eq("id", keyId)
    .select("id, label, key_prefix, created_at, last_used_at, expires_at, scope")
    .maybeSingle();

  if (error) {
    logger.error("mcp.apiKeys: rename failed", {
      cause: error.message,
      userId,
      keyId,
      impact: "key kept its previous name",
    });
    throw new Error(`Failed to rename API key: ${error.message}`);
  }

  if (!data) throw new Error("That API key does not exist.");

  logger.info("mcp.apiKeys: key renamed", { userId, keyId });
  return toRecord(data as unknown as KeyRow);
}

/**
 * Revokes (deletes) one of a user's API keys.
 *
 * @param client - Supabase client authenticated as the user (RLS applies)
 * @param userId - Owner of the key
 * @param keyId - Id of the key to revoke
 * @returns Nothing
 * @throws Error when the key does not exist for this user, or the delete fails
 * @remarks Scoped by user_id as well as id so one user can never revoke
 *          another's key even if RLS were misconfigured.
 */
export async function revokeApiKey(
  client: SupabaseClient,
  userId: string,
  keyId: string
): Promise<void> {
  const { data, error } = await client
    .from("mcp_api_keys")
    .delete()
    .eq("user_id", userId)
    .eq("id", keyId)
    .select("id");

  if (error) {
    logger.error("mcp.apiKeys: revoke failed", {
      cause: error.message,
      userId,
      keyId,
      impact: "user could not revoke an MCP key",
    });
    throw new Error(`Failed to revoke API key: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("That API key does not exist.");
  }

  logger.info("mcp.apiKeys: key revoked", { userId, keyId });
}

/**
 * Resolves a presented API key to its owner.
 *
 * @param client - Supabase client able to read every key (service role)
 * @param key - Plaintext key from the Authorization header
 * @returns The owning user id, key id and the key's scope, or null when no
 *          key matches
 * @remarks Never logs the presented key. A failed database read is logged and
 *          treated as "no match" so a transient error denies access rather
 *          than granting it.
 */
export async function findKeyOwner(
  client: SupabaseClient,
  key: string
): Promise<{ userId: string; keyId: string; scope: McpScope } | null> {
  const { data, error } = await client
    .from("mcp_api_keys")
    .select("id, user_id, expires_at, scope")
    .eq("key_hash", hashApiKey(key))
    .maybeSingle();

  if (error) {
    logger.error("mcp.apiKeys: lookup failed", {
      cause: error.message,
      impact: "MCP request denied because the key could not be verified",
    });
    return null;
  }

  if (!data) return null;

  const row = data as unknown as {
    id: string;
    user_id: string;
    expires_at: string | null;
    scope: string | null;
  };

  // An expired key is treated exactly like an unknown one.
  if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) {
    logger.warn("mcp.apiKeys: expired key presented", {
      cause: `key expired at ${row.expires_at}`,
      keyId: row.id,
      impact: "MCP request denied; user must generate a new key",
    });
    return null;
  }

  return { userId: row.user_id, keyId: row.id, scope: coerceScope(row.scope) };
}

/**
 * Stamps a key as used, so the UI can show whether it has ever connected.
 *
 * @param client - Supabase client able to write every key (service role)
 * @param keyId - Id of the key that authenticated the request
 * @returns Nothing
 * @remarks Failures are logged and swallowed: a bookkeeping write must never
 *          fail an MCP request that was otherwise authenticated.
 */
export async function touchApiKey(client: SupabaseClient, keyId: string): Promise<void> {
  const { error } = await client
    .from("mcp_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyId);

  if (error) {
    logger.warn("mcp.apiKeys: last_used_at not recorded", {
      cause: error.message,
      keyId,
      impact: "settings may show a stale last-used time; request still served",
    });
  }
}

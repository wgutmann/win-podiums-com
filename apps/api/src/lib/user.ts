/**
 * D1 user and auth token operations. See docs/design/data-models/database-schema.md.
 */
import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import type { DiscordUser } from "./discord";

export type AuthMethod = "web" | "plugin_browser" | "plugin_qr" | "plugin_token";

/** Upsert user from Discord identity; update last_active_at. */
export async function upsertUser(
  db: D1Database,
  discord: DiscordUser,
  authMethod: AuthMethod
): Promise<void> {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await db
    .prepare(
      `INSERT INTO users (discord_id, discord_username, discord_avatar, verification_state, auth_method, last_active_at, created_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)
       ON CONFLICT(discord_id) DO UPDATE SET
         discord_username = excluded.discord_username,
         discord_avatar = excluded.discord_avatar,
         auth_method = COALESCE(users.auth_method, excluded.auth_method),
         last_active_at = excluded.last_active_at`
    )
    .bind(
      discord.id,
      discord.username,
      discord.avatar ?? null,
      authMethod,
      now,
      now
    )
    .run();
}

/** Generate UUID v4. */
function uuid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Store or replace auth token for user. Expires_at as ISO string. */
export async function storeAuthToken(
  db: D1Database,
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: string
): Promise<void> {
  const tokenId = uuid();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await db
    .prepare(
      `INSERT INTO auth_tokens (token_id, user_id, access_token, refresh_token, expires_at, scope, created_at)
       VALUES (?, ?, ?, ?, ?, 'identify', ?)`
    )
    .bind(tokenId, userId, accessToken, refreshToken, expiresAt, now)
    .run();
}

/** Get latest access_token for user (for manual token flow). */
export async function getAuthTokenForUser(
  db: D1Database,
  userId: string
): Promise<{ access_token: string; expires_at: string } | null> {
  const row = await db
    .prepare(
      `SELECT access_token, expires_at FROM auth_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .bind(userId)
    .first<{ access_token: string; expires_at: string }>();
  return row ?? null;
}

/** Resolve Bearer token to user_id (from auth_tokens). */
export async function getUserIdByAccessToken(
  db: D1Database,
  accessToken: string
): Promise<string | null> {
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
  const row = await db
    .prepare(
      `SELECT user_id FROM auth_tokens WHERE access_token = ? AND expires_at > ? LIMIT 1`
    )
    .bind(accessToken, nowStr)
    .first<{ user_id: string }>();
  return row?.user_id ?? null;
}

/** Get token row by access_token (including expired). Used for refresh flow; returns same-row refresh_token. */
export async function getTokenRowByAccessTokenAllowExpired(
  db: D1Database,
  accessToken: string
): Promise<{ user_id: string; token_id: string; refresh_token: string } | null> {
  const row = await db
    .prepare(
      `SELECT user_id, token_id, refresh_token FROM auth_tokens WHERE access_token = ? LIMIT 1`
    )
    .bind(accessToken)
    .first<{ user_id: string; token_id: string; refresh_token: string }>();
  return row ?? null;
}

/** Update auth_tokens with new tokens after Discord refresh. */
export async function updateAuthTokens(
  db: D1Database,
  tokenId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE auth_tokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE token_id = ?`
    )
    .bind(accessToken, refreshToken, expiresAt, tokenId)
    .run();
}

/** Create manual token row; return token_code. */
export async function createManualToken(
  db: D1Database,
  userId: string
): Promise<string> {
  const code = randomTokenCode(8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
  const nowStr = now.toISOString().replace("T", " ").slice(0, 19);
  const expiresStr = expiresAt.toISOString().replace("T", " ").slice(0, 19);
  await db
    .prepare(
      `INSERT INTO manual_tokens (token_code, user_id, status, expires_at, created_at)
       VALUES (?, ?, 'pending', ?, ?)`
    )
    .bind(code, userId, expiresStr, nowStr)
    .run();
  return code;
}

function randomTokenCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

/** Consume manual token; return user_id or null. */
export async function consumeManualToken(
  db: D1Database,
  tokenCode: string
): Promise<string | null> {
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
  const row = await db
    .prepare(
      `SELECT user_id FROM manual_tokens WHERE token_code = ? AND status = 'pending' AND expires_at > ?`
    )
    .bind(tokenCode.toUpperCase().trim(), nowStr)
    .first<{ user_id: string }>();
  if (!row) return null;
  await db
    .prepare(
      `UPDATE manual_tokens SET status = 'used', used_at = ? WHERE token_code = ?`
    )
    .bind(nowStr, tokenCode.toUpperCase().trim())
    .run();
  return row.user_id;
}

export interface UserProfileRow {
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  verification_state: string;
  auth_method: string | null;
  last_active_at: string;
}

/** Get user profile by discord_id; optional KV cache. */
export async function getProfile(
  db: D1Database,
  kv: KVNamespace | undefined,
  discordId: string
): Promise<UserProfileRow | null> {
  const cacheKey = `user:${discordId}`;
  if (kv) {
    const cached = await kv.get(cacheKey);
    if (cached) return JSON.parse(cached) as UserProfileRow;
  }
  const row = await db
    .prepare(
      `SELECT discord_id, discord_username, discord_avatar, verification_state, auth_method, last_active_at FROM users WHERE discord_id = ?`
    )
    .bind(discordId)
    .first<UserProfileRow>();
  if (!row) return null;
  const profile = row;
  if (kv) {
    await kv.put(cacheKey, JSON.stringify(profile), { expirationTtl: 3600 });
  }
  return profile;
}

/** Record plugin heartbeat: update latest installation for user or insert. */
export async function recordHeartbeat(
  db: D1Database,
  userId: string,
  pluginVersion: string
): Promise<void> {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const existing = await db
    .prepare(
      `SELECT install_id FROM plugin_installations WHERE user_id = ? ORDER BY last_heartbeat DESC LIMIT 1`
    )
    .bind(userId)
    .first<{ install_id: string }>();
  if (existing) {
    await db
      .prepare(
        `UPDATE plugin_installations SET last_heartbeat = ?, plugin_version = ?, status = 'active' WHERE install_id = ?`
      )
      .bind(now, pluginVersion, existing.install_id)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO plugin_installations (install_id, user_id, plugin_version, last_heartbeat, install_date, install_type, status)
         VALUES (?, ?, ?, ?, ?, 'generic', 'active')`
      )
      .bind(uuid(), userId, pluginVersion, now, now)
      .run();
  }
}

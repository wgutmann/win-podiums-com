# Low-Level Design: Database Schema

**Database**: Cloudflare D1 (SQLite) + Workers KV (Caching)  
**Version**: 1.0  
**Last Updated**: 2026-01-31

## Overview

WinPodiums uses Cloudflare D1 (SQLite-based edge database) for storing user profiles, authentication data, race results, and telemetry verification state. **Workers KV** is used for caching frequently-read data to reduce D1 read operations and stay within free tier limits.

## Entity Relationship Diagram

```
User (1) ──────< (*) AuthToken
User (1) ──────< (*) RaceResult
User (1) ──────< (*) PluginInstallation
User (1) ──────< (*) RateLimitLog
User (1) ──────< (*) QRAuthSession (nullable FK until complete)
User (1) ──────< (*) ManualToken
```

## Schema Definitions

### Users Table

Primary entity representing a member.

```sql
CREATE TABLE users (
    discord_id TEXT PRIMARY KEY,
    discord_username TEXT NOT NULL,
    discord_avatar TEXT,                 -- Discord CDN URL
    verification_state TEXT NOT NULL CHECK(verification_state IN ('pending', 'verified', 'suspended')),
    auth_method TEXT CHECK(auth_method IN ('web', 'plugin_browser', 'plugin_qr', 'plugin_token')),
    first_verified_at DATETIME,
    total_podiums INTEGER DEFAULT 0,
    last_active_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_verification_state ON users(verification_state);
CREATE INDEX idx_users_last_active ON users(last_active_at);
```

**Indexes**:
- Primary key on `discord_id` (automatic)
- Index on `verification_state` (filter verified members)
- Index on `last_active_at` (identify inactive users)

**Notes**:
- `discord_id` is Discord's unique user ID (snowflake, stored as TEXT)
- `auth_method` tracks which authentication path the user used
- `first_verified_at` is set when first podium is verified (NULL until then)
- `last_active_at` updated on every API call (plugin heartbeat, web visit)

### AuthToken Table

Stores encrypted OAuth2 tokens for users.

```sql
CREATE TABLE auth_tokens (
    token_id TEXT PRIMARY KEY,           -- UUID
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,          -- Encrypted with Workers Secrets
    refresh_token TEXT NOT NULL,         -- Encrypted with Workers Secrets
    expires_at DATETIME NOT NULL,
    scope TEXT NOT NULL,                 -- "identify"
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
```

**Indexes**:
- Primary key on `token_id`
- Index on `user_id` (lookup user's tokens)
- Index on `expires_at` (cleanup expired tokens)

**Notes**:
- Tokens encrypted at rest using Cloudflare Workers Secrets + AES-256
- `token_id` is UUID v4
- Cascade delete removes tokens when user is deleted

### QRAuthSession Table

Tracks QR code authentication sessions (temporary).

```sql
CREATE TABLE qr_auth_sessions (
    session_id TEXT PRIMARY KEY,         -- UUID
    user_id TEXT,                        -- NULL until auth complete
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'expired')),
    auth_code TEXT,                      -- Populated by mobile callback
    expires_at DATETIME NOT NULL,        -- 10 minutes from creation
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_qr_sessions_expires_at ON qr_auth_sessions(expires_at);
CREATE INDEX idx_qr_sessions_status ON qr_auth_sessions(status);
```

**Indexes**:
- Primary key on `session_id`
- Index on `expires_at` (cleanup expired sessions)
- Index on `status` (find pending sessions)

**Notes**:
- `session_id` is UUID v4 (embedded in QR code)
- Auto-delete sessions after 1 hour (cleanup job)
- `user_id` populated when mobile callback completes

### ManualToken Table

Tracks one-time manual authentication tokens.

```sql
CREATE TABLE manual_tokens (
    token_code TEXT PRIMARY KEY,         -- 8-char alphanumeric (e.g., "AB12CD34")
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'used', 'expired')),
    used_at DATETIME,                    -- Set when token is used
    expires_at DATETIME NOT NULL,        -- 10 minutes from creation
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_manual_tokens_expires_at ON manual_tokens(expires_at);
CREATE INDEX idx_manual_tokens_user_id ON manual_tokens(user_id);
```

**Indexes**:
- Primary key on `token_code`
- Index on `expires_at` (cleanup expired tokens)
- Index on `user_id` (find user's tokens, rate limiting)

**Notes**:
- `token_code` is 8-character uppercase alphanumeric (62^8 combinations)
- Auto-delete tokens after 24 hours (cleanup job)
- Rate limit: Max 3 token generation requests per user per hour

### RaceResults Table

Stores verified podium finishes.

```sql
CREATE TABLE race_results (
    result_id TEXT PRIMARY KEY,          -- UUID
    user_id TEXT NOT NULL,
    session_date DATETIME NOT NULL,
    track_name TEXT NOT NULL,
    vehicle_class TEXT NOT NULL,
    sim_platform TEXT NOT NULL CHECK(sim_platform IN ('iRacing', 'ACC', 'rFactor2')),
    final_position INTEGER NOT NULL CHECK(final_position IN (1, 2, 3)),
    competitiveness_score REAL NOT NULL CHECK(competitiveness_score BETWEEN 0 AND 10),
    verification_signature TEXT NOT NULL, -- HMAC-SHA256
    verification_status TEXT NOT NULL CHECK(verification_status IN ('pending', 'verified', 'flagged')),
    telemetry_snapshot TEXT NOT NULL,     -- JSON blob
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_race_results_user_id ON race_results(user_id);
CREATE INDEX idx_race_results_session_date ON race_results(session_date DESC);
CREATE INDEX idx_race_results_verification_status ON race_results(verification_status);
CREATE INDEX idx_race_results_sim_platform ON race_results(sim_platform);
```

**Indexes**:
- Primary key on `result_id`
- Index on `user_id` (user's podium history)
- Index on `session_date` DESC (recent podiums first)
- Index on `verification_status` (find flagged results)
- Index on `sim_platform` (filter by sim)

**Notes**:
- `telemetry_snapshot` is JSON containing lap times, incidents, participant count, etc.
- `result_id` is UUID v4
- Race results retained indefinitely (core member achievement data)

### PluginInstallation Table

Tracks plugin installations and health status.

```sql
CREATE TABLE plugin_installations (
    install_id TEXT PRIMARY KEY,         -- UUID
    user_id TEXT NOT NULL,
    plugin_version TEXT NOT NULL,        -- Semantic version (e.g., "1.2.0")
    last_heartbeat DATETIME NOT NULL,
    install_date DATETIME NOT NULL,
    install_type TEXT NOT NULL CHECK(install_type IN ('generic', 'pre-linked')),
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'error')),
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_plugin_installations_user_id ON plugin_installations(user_id);
CREATE INDEX idx_plugin_installations_last_heartbeat ON plugin_installations(last_heartbeat DESC);
CREATE INDEX idx_plugin_installations_status ON plugin_installations(status);
```

**Indexes**:
- Primary key on `install_id`
- Index on `user_id` (user's plugin installations)
- Index on `last_heartbeat` DESC (find stale installations)
- Index on `status` (count active/inactive)

**Notes**:
- `install_id` is UUID v4
- Multiple installations per user possible (e.g., multiple PCs)
- `last_heartbeat` updated every 5 minutes (plugin health check)

### RateLimitLog Table

Tracks API usage for rate limiting and abuse prevention.

```sql
CREATE TABLE rate_limit_logs (
    log_id TEXT PRIMARY KEY,             -- UUID
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL CHECK(endpoint IN ('verify', 'auth', 'heartbeat')),
    request_count INTEGER NOT NULL,
    window_start DATETIME NOT NULL,
    window_end DATETIME NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE INDEX idx_rate_limit_logs_user_endpoint ON rate_limit_logs(user_id, endpoint, window_end DESC);
CREATE INDEX idx_rate_limit_logs_window_end ON rate_limit_logs(window_end);
```

**Indexes**:
- Primary key on `log_id`
- Composite index on `(user_id, endpoint, window_end)` for rate limit checks
- Index on `window_end` for cleanup

**Notes**:
- `log_id` is UUID v4
- Retained for 30 days (compliance and abuse investigation)
- Used to enforce rate limits (e.g., max 10 podium submissions per day)

## Data Retention Policies

| Table | Retention Period | Cleanup Method |
|-------|------------------|----------------|
| users | Indefinite | Manual deletion (GDPR right to erasure) |
| auth_tokens | 30 days after expiry | Scheduled cleanup job |
| qr_auth_sessions | 1 hour | Scheduled cleanup job |
| manual_tokens | 24 hours | Scheduled cleanup job |
| race_results | Indefinite | Never deleted (core achievement data) |
| plugin_installations | Indefinite | Marked inactive if no heartbeat for 30 days |
| rate_limit_logs | 30 days | Scheduled cleanup job |

## Cleanup Jobs

Scheduled Cloudflare Workers Cron jobs:

```typescript
// runs every hour
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const db = env.DB;
    
    // Clean up expired QR sessions (older than 1 hour)
    await db.prepare(`
      DELETE FROM qr_auth_sessions
      WHERE expires_at < datetime('now', '-1 hour')
    `).run();
    
    // Clean up expired manual tokens (older than 24 hours)
    await db.prepare(`
      DELETE FROM manual_tokens
      WHERE created_at < datetime('now', '-24 hours')
    `).run();
    
    // Clean up expired auth tokens (older than 30 days past expiry)
    await db.prepare(`
      DELETE FROM auth_tokens
      WHERE expires_at < datetime('now', '-30 days')
    `).run();
    
    // Clean up old rate limit logs (older than 30 days)
    await db.prepare(`
      DELETE FROM rate_limit_logs
      WHERE window_end < datetime('now', '-30 days')
    `).run();
    
    // Mark plugin installations as inactive if no heartbeat for 30 days
    await db.prepare(`
      UPDATE plugin_installations
      SET status = 'inactive'
      WHERE last_heartbeat < datetime('now', '-30 days')
        AND status = 'active'
    `).run();
  }
};
```

## Encryption

### Token Encryption (Workers Secrets)

```typescript
// Encrypt tokens before storing in D1
async function encryptToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  
  // Import secret as CryptoKey
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Return IV + ciphertext as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// Decrypt tokens when retrieving from D1
async function decryptToken(encrypted: string, secret: string): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  
  // Extract IV and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // Import secret as CryptoKey
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}
```

## Migration Strategy

### Initial Migration (v1.0)

```sql
-- migrations/001_initial_schema.sql

BEGIN TRANSACTION;

-- Create all tables (as defined above)
-- ...

-- Seed data (none for production; staging may have test users)

COMMIT;
```

### Example Migration (Future)

```sql
-- migrations/002_add_user_preferences.sql

BEGIN TRANSACTION;

-- Add preferences column to users table
ALTER TABLE users ADD COLUMN preferences TEXT; -- JSON blob

-- Create index if needed
CREATE INDEX idx_users_preferences ON users(preferences);

COMMIT;
```

### Migration Tool

Use Wrangler D1 migrations:

```bash
# Create migration
wrangler d1 migrations create DB_NAME migration_name

# Apply migrations locally
wrangler d1 migrations apply DB_NAME --local

# Apply migrations to production
wrangler d1 migrations apply DB_NAME --remote
```

## Database Constraints & Size Limits

### D1 Limits (as of 2026)
- **Max database size**: 10 GB per D1
- **Max rows**: Effectively unlimited (limited by 10GB size)
- **Max query execution time**: 30 seconds (more than enough for simple queries)
- **Max request size**: 1 MB (including SQL + parameters)

### Estimated Growth
- **Users**: ~200 bytes/user → 10GB = 50M users (far beyond initial target)
- **RaceResults**: ~1KB/result → 10GB = 10M results (100 results per user for 100K users)
- **AuthTokens**: ~500 bytes/token → Negligible (few active tokens per user)

**Conclusion**: D1 size limits are not a concern for initial 10-100K member target. Plan migration to Postgres only if user base exceeds 100K members or if D1 consistency model causes issues.

## Backup & Disaster Recovery

### Backups
- **Automated**: Cloudflare performs automatic D1 backups (30-day retention)
- **Manual**: Export D1 to SQLite file via `wrangler d1 export`

### Disaster Recovery
1. **Data loss**: Restore from most recent Cloudflare backup
2. **Corruption**: Export to SQLite, repair with SQLite tools, re-import
3. **Scaling**: D1 can handle 50M users - no migration needed. If truly needed, could use Cloudflare Hyperdrive to connect to external Postgres (but breaks Cloudflare-only rule)

## Caching Strategy (Cost Optimization)

### Workers KV for User Profiles

**Purpose**: Reduce D1 read operations by 90% to stay in free tier longer.

**Pattern**: KV Cache → D1 Fallback → Update Cache

```typescript
// Cost-optimized user profile retrieval
async function getUserProfile(discordId: string, env: Env): Promise<User | null> {
  // Try KV cache first (free, fast)
  const cached = await env.KV.get(`user:${discordId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fallback to D1 (counts toward free tier)
  const user = await env.DB.prepare('SELECT * FROM users WHERE discord_id = ?')
    .bind(discordId)
    .first<User>();
  
  // Cache for 1 hour (reduce future D1 reads)
  if (user) {
    await env.KV.put(`user:${discordId}`, JSON.stringify(user), {
      expirationTtl: 3600 // 1 hour
    });
  }
  
  return user;
}

// Invalidate cache on user updates
async function updateUserProfile(discordId: string, updates: Partial<User>, env: Env) {
  await env.DB.prepare('UPDATE users SET ... WHERE discord_id = ?').bind(discordId).run();
  
  // Invalidate cache (force refresh on next read)
  await env.KV.delete(`user:${discordId}`);
}
```

**Cost Impact**:
- **Before**: 50 D1 reads/user/day = 500K reads/day (10K users)
- **After**: 5 D1 reads/user/day (90% cache hit rate) = 50K reads/day
- **Savings**: 90% reduction = stays in free tier (5M reads/day) longer

### What to Cache in KV

**Cache** (Frequently read, rarely updated):
- User profiles (`user:{discordId}`) - TTL: 1 hour
- Rate limit counters (`ratelimit:{userId}:{endpoint}`) - TTL: 1 hour
- Plugin version info (`plugin:latest`) - TTL: 24 hours

**Don't Cache** (Frequently updated):
- Race results (always fresh from D1)
- Auth tokens (security-sensitive, always fresh)
- QR sessions (short-lived, not worth caching)

## Related Documentation

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Workers KV Docs](https://developers.cloudflare.com/kv/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Cost Optimization ADR](../../architecture/decisions/005-cost-optimized-cloudflare.md)
- [Data Model Diagram](../diagrams/entity-relationship.mmd)
- [API Data Contracts](../../api/) — Request/response schemas

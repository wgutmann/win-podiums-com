-- WinPodiums D1 initial schema (Phase 1)
-- Creates empty tables only; no data. See docs/design/data-models/database-schema.md.

-- Users: primary member entity
CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    discord_username TEXT NOT NULL,
    discord_avatar TEXT,
    verification_state TEXT NOT NULL DEFAULT 'pending' CHECK(verification_state IN ('pending', 'verified', 'suspended')),
    auth_method TEXT CHECK(auth_method IN ('web', 'plugin_browser', 'plugin_qr', 'plugin_token')),
    first_verified_at DATETIME,
    total_podiums INTEGER DEFAULT 0,
    last_active_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_verification_state ON users(verification_state);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

-- Auth tokens: OAuth2 tokens (encrypted at rest)
CREATE TABLE IF NOT EXISTS auth_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    scope TEXT NOT NULL DEFAULT 'identify',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- QR auth sessions: temporary sessions for QR flow
CREATE TABLE IF NOT EXISTS qr_auth_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'expired')),
    auth_code TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires_at ON qr_auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_status ON qr_auth_sessions(status);

-- Manual tokens: one-time codes for plugin manual auth
CREATE TABLE IF NOT EXISTS manual_tokens (
    token_code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'used', 'expired')),
    used_at DATETIME,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_manual_tokens_expires_at ON manual_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_manual_tokens_user_id ON manual_tokens(user_id);

-- Race results: verified podium finishes (Phase 2+; create table for schema completeness)
CREATE TABLE IF NOT EXISTS race_results (
    result_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_date DATETIME NOT NULL,
    track_name TEXT NOT NULL,
    vehicle_class TEXT NOT NULL,
    sim_platform TEXT NOT NULL CHECK(sim_platform IN ('iRacing', 'ACC', 'rFactor2')),
    final_position INTEGER NOT NULL CHECK(final_position IN (1, 2, 3)),
    competitiveness_score REAL NOT NULL CHECK(competitiveness_score BETWEEN 0 AND 10),
    verification_signature TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'flagged')),
    telemetry_snapshot TEXT NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_race_results_user_id ON race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_session_date ON race_results(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_verification_status ON race_results(verification_status);
CREATE INDEX IF NOT EXISTS idx_race_results_sim_platform ON race_results(sim_platform);

-- Plugin installations: heartbeat and version tracking
CREATE TABLE IF NOT EXISTS plugin_installations (
    install_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plugin_version TEXT NOT NULL,
    last_heartbeat DATETIME NOT NULL,
    install_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    install_type TEXT NOT NULL DEFAULT 'generic' CHECK(install_type IN ('generic', 'pre-linked')),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'error')),
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_plugin_installations_user_id ON plugin_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_installations_last_heartbeat ON plugin_installations(last_heartbeat DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_installations_status ON plugin_installations(status);

-- Rate limit logs: API usage tracking
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    log_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL CHECK(endpoint IN ('verify', 'auth', 'heartbeat')),
    request_count INTEGER NOT NULL,
    window_start DATETIME NOT NULL,
    window_end DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(discord_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_endpoint ON rate_limit_logs(user_id, endpoint, window_end DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_window_end ON rate_limit_logs(window_end);

-- V5 wallet. Never expose private wallet tables as a public JSON endpoint.
CREATE TABLE IF NOT EXISTS wallets (id TEXT PRIMARY KEY,name TEXT NOT NULL,name_key TEXT NOT NULL UNIQUE,pass_salt TEXT NOT NULL,pass_hash TEXT NOT NULL,coins INTEGER NOT NULL DEFAULT 0,correct INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS wallet_sessions (token_hash TEXT PRIMARY KEY,wallet_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_exp ON wallet_sessions(expires_at);
CREATE TABLE IF NOT EXISTS wallet_challenges (id TEXT PRIMARY KEY,wallet_id TEXT NOT NULL,module TEXT NOT NULL,variant INTEGER NOT NULL,answer INTEGER NOT NULL,correct_option TEXT NOT NULL,explanation TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL,completed_at INTEGER);
CREATE INDEX IF NOT EXISTS idx_wallet_challenges_owner ON wallet_challenges(wallet_id,created_at);
CREATE TABLE IF NOT EXISTS wallet_login_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,ip_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_wallet_login_logs_ip ON wallet_login_logs(ip_hash,created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_challenge_unique ON wallet_challenges(wallet_id,module,variant);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 10),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at DESC);
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  visible INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_feedback_visible ON feedback(visible, created_at DESC);

-- V5 wallet. Never expose private wallet tables as a public JSON endpoint.
CREATE TABLE IF NOT EXISTS wallets (id TEXT PRIMARY KEY,name TEXT NOT NULL,name_key TEXT NOT NULL UNIQUE,pass_salt TEXT NOT NULL,pass_hash TEXT NOT NULL,coins INTEGER NOT NULL DEFAULT 0,correct INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS wallet_sessions (token_hash TEXT PRIMARY KEY,wallet_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_exp ON wallet_sessions(expires_at);
CREATE TABLE IF NOT EXISTS wallet_challenges (id TEXT PRIMARY KEY,wallet_id TEXT NOT NULL,module TEXT NOT NULL,variant INTEGER NOT NULL,answer INTEGER NOT NULL,correct_option TEXT NOT NULL,explanation TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL,completed_at INTEGER);
CREATE INDEX IF NOT EXISTS idx_wallet_challenges_owner ON wallet_challenges(wallet_id,created_at);
CREATE TABLE IF NOT EXISTS wallet_login_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,ip_hash TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_wallet_login_logs_ip ON wallet_login_logs(ip_hash,created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_challenge_unique ON wallet_challenges(wallet_id,module,variant);

-- Bluebird ScanBridge (for new D1 installations)
CREATE TABLE IF NOT EXISTS scan_records (
  id TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BARCODE','QR_CODE','UNKNOWN')),
  source TEXT NOT NULL CHECK (source IN ('BLUEBIRD_INTENT','KEYBOARD','CAMERA')),
  scanned_at TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scan_records_received ON scan_records(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_records_value ON scan_records(value);
CREATE INDEX IF NOT EXISTS idx_scan_records_type ON scan_records(type);

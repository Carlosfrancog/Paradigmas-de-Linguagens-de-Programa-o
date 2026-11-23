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

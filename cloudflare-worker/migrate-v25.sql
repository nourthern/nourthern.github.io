-- Separate live/beta telemetry and add dashboard-managed presentation settings.
ALTER TABLE installations ADD COLUMN channel TEXT NOT NULL DEFAULT 'live';
ALTER TABLE telemetry_installations ADD COLUMN channel TEXT NOT NULL DEFAULT 'live';
ALTER TABLE telemetry_installations ADD COLUMN excluded_from_aggregates INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bug_reports ADD COLUMN channel TEXT NOT NULL DEFAULT 'live';

CREATE INDEX IF NOT EXISTS idx_installations_channel ON installations(channel);
CREATE INDEX IF NOT EXISTS idx_telemetry_channel_seen ON telemetry_installations(channel,last_seen_at);
CREATE INDEX IF NOT EXISTS idx_bug_reports_channel_created ON bug_reports(channel,created_at);

CREATE TABLE IF NOT EXISTS site_customization (
  channel TEXT PRIMARY KEY CHECK (channel IN ('live','beta')),
  config_json TEXT NOT NULL DEFAULT '{}',
  banner_data BLOB,
  banner_mime_type TEXT,
  banner_updated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

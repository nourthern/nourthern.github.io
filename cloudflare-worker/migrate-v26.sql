-- PIER v26 privacy-safe product analytics, persistent dashboard deletions,
-- and five-version site-customisation draft/backup workflow.

ALTER TABLE telemetry_installations ADD COLUMN first_seen_at TEXT;
UPDATE telemetry_installations SET first_seen_at=COALESCE(first_seen_at,last_seen_at,CURRENT_TIMESTAMP);
ALTER TABLE telemetry_installations ADD COLUMN device_type TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE telemetry_installations ADD COLUMN calendar_import_successes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN calendar_import_failures INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN calendar_failure_reasons_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE telemetry_installations ADD COLUMN ics_file_imports INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN ics_url_imports INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN shifts_imported INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN shifts_edited INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN shifts_added INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN claims_created INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN time_to_first_pdf_minutes INTEGER;
ALTER TABLE telemetry_installations ADD COLUMN funnel_stage TEXT NOT NULL DEFAULT 'opened';
ALTER TABLE telemetry_installations ADD COLUMN humber_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN payroll_email_clicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN survey_time_without_pier TEXT;
ALTER TABLE telemetry_installations ADD COLUMN survey_ease_rating INTEGER;

CREATE TABLE IF NOT EXISTS telemetry_suppressions (
  channel TEXT NOT NULL CHECK (channel IN ('live','beta')),
  installation_id TEXT NOT NULL,
  deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (channel, installation_id)
);

CREATE TABLE IF NOT EXISTS site_customization_drafts (
  channel TEXT PRIMARY KEY CHECK (channel IN ('live','beta')),
  config_json TEXT NOT NULL DEFAULT '{}',
  banner_data BLOB,
  banner_mime_type TEXT,
  banner_updated_at TEXT,
  preview_token TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_customization_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL CHECK (channel IN ('live','beta')),
  config_json TEXT NOT NULL DEFAULT '{}',
  banner_data BLOB,
  banner_mime_type TEXT,
  banner_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_channel_first_seen ON telemetry_installations(channel,first_seen_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_draft_preview_token ON site_customization_drafts(preview_token);
CREATE INDEX IF NOT EXISTS idx_site_backups_channel_created ON site_customization_backups(channel,created_at DESC,id DESC);

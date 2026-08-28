-- PIER v19 reminder, telemetry and diagnostics database.
-- Deliberately excludes names, addresses, personal numbers, registrations,
-- calendar URLs, shift details, journey rows, signatures and PDF contents.

CREATE TABLE IF NOT EXISTS installations (
  installation_id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'live',
  token_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  pref_monthly INTEGER NOT NULL DEFAULT 1,
  pref_deadline INTEGER NOT NULL DEFAULT 1,
  pref_rota INTEGER NOT NULL DEFAULT 1,
  pref_unfinished INTEGER NOT NULL DEFAULT 1,
  reminder_time TEXT NOT NULL DEFAULT '18:00',
  monthly_day INTEGER NOT NULL DEFAULT 1,
  deadline_days_before INTEGER NOT NULL DEFAULT 3,
  unfinished_day INTEGER NOT NULL DEFAULT 3,
  deadline_today INTEGER NOT NULL DEFAULT 1,
  push_failed INTEGER NOT NULL DEFAULT 0,
  push_failure_message TEXT,
  last_push_failure_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_state (
  installation_id TEXT NOT NULL,
  month TEXT NOT NULL,
  has_shifts INTEGER NOT NULL DEFAULT 0,
  claim_created INTEGER NOT NULL DEFAULT 0,
  pdf_downloaded INTEGER NOT NULL DEFAULT 0,
  submitted INTEGER NOT NULL DEFAULT 0,
  needs_review_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (installation_id, month)
);

CREATE TABLE IF NOT EXISTS pending_notifications (
  installation_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_log (
  installation_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  month TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (installation_id, kind, month, dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_claim_state_month ON claim_state(month);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON notification_log(sent_at);

-- One current, non-identifying aggregate contribution per installation.
-- No individual claim values or claim history are stored.
CREATE TABLE IF NOT EXISTS telemetry_installations (
  installation_id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'live',
  token_hash TEXT NOT NULL,
  app_version TEXT NOT NULL,
  claimed_last_3_months_pence INTEGER NOT NULL DEFAULT 0,
  claimed_current_year_pence INTEGER NOT NULL DEFAULT 0,
  claimed_last_12_months_pence INTEGER NOT NULL DEFAULT 0,
  miles_last_3_months_tenths INTEGER NOT NULL DEFAULT 0,
  miles_last_12_months_tenths INTEGER NOT NULL DEFAULT 0,
  calendar_imports INTEGER NOT NULL DEFAULT 0,
  pdfs_created INTEGER NOT NULL DEFAULT 0,
  backups_created INTEGER NOT NULL DEFAULT 0,
  notification_setups INTEGER NOT NULL DEFAULT 0,
  first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  device_type TEXT NOT NULL DEFAULT 'unknown',
  calendar_import_successes INTEGER NOT NULL DEFAULT 0,
  calendar_import_failures INTEGER NOT NULL DEFAULT 0,
  calendar_failure_reasons_json TEXT NOT NULL DEFAULT '{}',
  ics_file_imports INTEGER NOT NULL DEFAULT 0,
  ics_url_imports INTEGER NOT NULL DEFAULT 0,
  shifts_imported INTEGER NOT NULL DEFAULT 0,
  shifts_edited INTEGER NOT NULL DEFAULT 0,
  shifts_added INTEGER NOT NULL DEFAULT 0,
  claims_created INTEGER NOT NULL DEFAULT 0,
  time_to_first_pdf_minutes INTEGER,
  funnel_stage TEXT NOT NULL DEFAULT 'opened',
  humber_clicks INTEGER NOT NULL DEFAULT 0,
  payroll_email_clicks INTEGER NOT NULL DEFAULT 0,
  survey_time_without_pier TEXT,
  survey_ease_rating INTEGER,
  excluded_from_aggregates INTEGER NOT NULL DEFAULT 0,
  last_pdf_created_at TEXT,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_last_seen ON telemetry_installations(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_last_pdf ON telemetry_installations(last_pdf_created_at);

CREATE TABLE IF NOT EXISTS bug_reports (
  report_id TEXT PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'live',
  description TEXT NOT NULL,
  technical_details TEXT,
  screenshot_data BLOB,
  screenshot_mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_expires ON bug_reports(expires_at);

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

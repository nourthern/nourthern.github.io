-- Travel Claims Manager v16 reminder, telemetry and diagnostics database.
-- Deliberately excludes names, addresses, personal numbers, registrations,
-- calendar URLs, shift details, journey rows, signatures and PDF contents.

CREATE TABLE IF NOT EXISTS installations (
  installation_id TEXT PRIMARY KEY,
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
  token_hash TEXT NOT NULL,
  app_version TEXT NOT NULL,
  claimed_last_3_months_pence INTEGER NOT NULL DEFAULT 0,
  claimed_current_year_pence INTEGER NOT NULL DEFAULT 0,
  claimed_last_12_months_pence INTEGER NOT NULL DEFAULT 0,
  calendar_imports INTEGER NOT NULL DEFAULT 0,
  pdfs_created INTEGER NOT NULL DEFAULT 0,
  backups_created INTEGER NOT NULL DEFAULT 0,
  notification_setups INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_last_seen ON telemetry_installations(last_seen_at);

CREATE TABLE IF NOT EXISTS bug_reports (
  report_id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  technical_details TEXT,
  screenshot_data BLOB,
  screenshot_mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_expires ON bug_reports(expires_at);

-- Travel Claims Manager v12 reminder database.
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

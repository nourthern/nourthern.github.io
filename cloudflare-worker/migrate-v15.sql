-- Run once against an existing v13/v14 D1 database before deploying Worker v15.
ALTER TABLE installations ADD COLUMN push_failed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE installations ADD COLUMN push_failure_message TEXT;
ALTER TABLE installations ADD COLUMN last_push_failure_at TEXT;
ALTER TABLE telemetry_installations ADD COLUMN claimed_current_year_pence INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bug_reports ADD COLUMN screenshot_data BLOB;
ALTER TABLE bug_reports ADD COLUMN screenshot_mime_type TEXT;

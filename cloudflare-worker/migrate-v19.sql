-- Add rolling mileage aggregates and a genuine claim-form generation date.
ALTER TABLE telemetry_installations ADD COLUMN miles_last_3_months_tenths INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN miles_last_12_months_tenths INTEGER NOT NULL DEFAULT 0;
ALTER TABLE telemetry_installations ADD COLUMN last_pdf_created_at TEXT;
CREATE INDEX IF NOT EXISTS idx_telemetry_last_pdf ON telemetry_installations(last_pdf_created_at);

-- The main telemetry reset is performed separately after this migration. Old
-- cumulative PDF counts are deliberately not assigned a guessed date.

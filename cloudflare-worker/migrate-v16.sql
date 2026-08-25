-- Run once against an existing v15 D1 database before deploying Worker v16.
ALTER TABLE telemetry_installations ADD COLUMN claimed_last_12_months_pence INTEGER NOT NULL DEFAULT 0;

-- Both existing values are subsets of a rolling 12-month total. Preserve the
-- larger one as a safe baseline until each active installation next syncs its
-- locally held 12-month expense-log total.
UPDATE telemetry_installations
SET claimed_last_12_months_pence = MAX(claimed_last_3_months_pence, claimed_current_year_pence);

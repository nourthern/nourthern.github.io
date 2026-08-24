# Cloudflare setup — Travel Claims Manager v13

This version keeps the existing ICS proxy and Web Push reminders, and adds **privacy-preserving telemetry, aggregate About statistics and time-limited bug reports using Cloudflare D1**.

The calendar-reminder `.ics` button works without D1. You only need the steps below if you want phone/browser push notifications.

## What is stored in D1

Reminder-delivery data:

- a random installation ID (not the user's name)
- a one-way hash of a random device token
- the browser push subscription endpoint (the Worker deliberately does not retain the subscription encryption keys because v11 uses empty Web Push wake-ups)
- enabled reminder categories and timing
- coarse month-level flags: rota present, claim created, PDF saved, submitted, number of study/SDT shifts needing review
- notification de-duplication records

Telemetry data:

- the same random installation ID and one-way token hash
- app version, last-seen date and coarse lifetime feature-use counts
- one current cumulative claim total for the last three months, in pence; it replaces the previous value and is used only for an all-users total

Bug reports contain the user's description and optional coarse technical details, linked by a one-off report ID. They expire after 90 days.

D1 does **not** store names, addresses, personal numbers, registrations, signatures, ICS URLs, shift details/times, journey rows, PDFs, mileage values, toll values or individual claim totals/history.

## Part A — update the existing Worker

1. Sign in to Cloudflare.
2. Open **Workers & Pages**.
3. Select your existing `travel-claims-ics` Worker.
4. Choose **Edit code**.
5. Replace the existing code with `cloudflare-worker/worker.js` from this v13 package.
6. Deploy/save the Worker.

Keep the same Worker address:

`https://travel-claims-ics.n-e-alwaa.workers.dev/`

The website already has this address built in.

## Part B — create the D1 database

1. In Cloudflare, open **D1 SQL Database**.
2. Select **Create database**.
3. Name it `travel-claims-reminders`.
4. Western Europe is sensible for this project. If you specifically want Cloudflare's EU jurisdiction restriction, select the EU jurisdiction when creating the database.
5. Create the database.
6. Open the database's **Console**.
7. Copy all of `cloudflare-worker/schema.sql`, paste it into the D1 console and run it.

If the database already exists, running the full schema is safe: it preserves the four reminder tables and adds `telemetry_installations` and `bug_reports`.

## Part C — bind D1 to your existing Worker

1. Return to **Workers & Pages** and select `travel-claims-ics`.
2. Open **Bindings** / **Settings → Bindings**.
3. Add a **D1 database** binding.
4. Set the variable name to exactly `DB`.
5. Select `travel-claims-reminders` and save/deploy.

## Part D — generate Web Push (VAPID) keys

Open `cloudflare-worker/generate-vapid-keys.html` locally and press **Generate keys**. It displays `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_JWK`; the generator runs locally.

In Worker **Settings → Variables and Secrets**:

- Add normal variable `VAPID_PUBLIC_KEY` with the generated public key.
- Add normal variable `VAPID_SUBJECT`, e.g. `mailto:your-address@nhs.net`.
- Add **Secret** `VAPID_PRIVATE_JWK` with the generated private JWK.

Never put `VAPID_PRIVATE_JWK` in the website or a public repository.

## Part E — restrict the Worker to the real website

Set Worker variable `ALLOWED_ORIGIN` to:

`https://nourthern.github.io`

Do not include a path, hash or query string.

The Worker defaults to allowing Allocate calendar host `nlag.allocate-cloud.co.uk`.

## Part F — add the hourly reminder schedule

In Worker **Settings → Triggers → Cron Triggers**, add:

`0 * * * *`

The Worker checks hourly and interprets reminder timing in each device's reported timezone.

## Part G — test it

1. Open the hosted HTTPS site.
2. Complete Setup.
3. Under **Reminders**, press **Enable push notifications**.
4. Allow notifications.
5. Press **Send test notification**.

On iPhone/iPad, add the site to the Home Screen first and enable notifications from the installed web app.

The four reminder groups are monthly claim reminder, deadline reminders, rota change alerts, and unfinished claim reminders. Once a month is marked submitted, scheduled reminders for that month stop.

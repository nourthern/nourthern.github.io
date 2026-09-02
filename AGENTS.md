# PIER agent instructions

PIER is **Painless and Intelligent Expenses Reporting**, a local-first travel expense tool.

1. Read `docs/PIER_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/TESTING.md`, and `docs/CHANGELOG.md` before making substantive changes to PIER.
2. Explicit user instructions supersede existing documentation.
3. When application behaviour changes, update `docs/PIER_SPEC.md`.
4. When architecture, infrastructure, privacy, storage, or data flow changes, update `docs/ARCHITECTURE.md`.
5. When colours, visual states, branding, or styling rules change, update `docs/DESIGN_SYSTEM.md`.
6. Consider every bug fix for regression coverage in `docs/TESTING.md`; important regressions must be documented and tested where practical.
7. Record significant changes under **Unreleased** in `docs/CHANGELOG.md`.
8. Do not knowingly leave code and documentation inconsistent.
9. Do not change documentation merely to make it agree with a software bug.
10. If implementation contradicts documented intended behaviour and the correct behaviour is unclear, flag the discrepancy instead of silently changing the specification.
11. Never put secrets, tokens, credentials, private ICS URLs, or user data in repository documentation.
12. Avoid unrelated code or documentation changes.

HTTPS is mandatory. Use beta for meaningful changes before production. Preserve local-first privacy: do not add server-side storage of names, addresses, payroll or personal numbers, signatures, complete rota information, or detailed individual claim histories merely for convenience. Keep telemetry minimal and privacy-preserving. Target WCAG 2.1 AA, including at least 4.5:1 contrast for normal text where applicable.

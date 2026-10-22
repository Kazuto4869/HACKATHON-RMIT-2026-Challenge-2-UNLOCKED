# SecureDocs Step 1–6 handoff for the later Step 7 review

2026-10-22, Asia/Saigon. Local website: <http://127.0.0.1:3000/>. Tide console: <http://127.0.0.1:8080/realms/securedocs/tide-console/>.

## Current status

| Step | Evidence / state |
|---|---|
| 1: product | `PRODUCT.md`, README: owner/requester/Guardian roles, document-specific permission grants and no single-Guardian authorization story are documented. Original separate Step 1 checklist was not supplied, so no unseen rubric is claimed checked. |
| 2: design | `DESIGN.md` updated to the approved light web UI; sidebar, card constraints, responsive layout, honest Pending/Locked/Available states implemented. No new design approval is needed. |
| 3: environment | Existing Docker Engine/container/volume/realm re-verified; public OIDC discovery works; direct Raziel documentation requests succeed. Original Step 3 report is historical evidence; current changes are recorded in Step 5/6 reports. |
| 4: UI + safe boundary | Existing prototype preserved and integrated; metadata-only API, public/locked screens, form validation and server guard retained. |
| 5: Tide/QEA | App-side implementation integrated with embedded keys. Website sign-in/create/read confirmed by the user; three enrolled admins and genuine quorum demonstration remain incomplete. |
| 6: core features | Persistent notes/requests, owner authorization, request status, protected reader and verified-admin handoff implemented. 32 tests/typecheck/build/negative HTTP checks pass. Full live acceptance is PARTIAL. |

Render is deferred by user request. Any prepared Render files are drafts; no cloud deployment, new paid resource or GitHub Pages substitute was created.

## Run/check locally

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
# In another terminal, after startup:
npm run verify:step6
```

Public local values are in ignored `.env.local`; exported Tide public adapter is ignored `tidecloak.json`. A different developer must export their own matching adapter, not copy private credentials. Database is `.data/securedocs.sqlite`; preserve it and the Docker volume. No reset/clean is part of the continuation.

## Finish live acceptance before Step 7 sign-off

- Client configuration is now resolved and read back: clean rootUrl, both local callbacks, signed origin, PKCE and three seed roles. Adapter has been re-exported and website restarted. Keep the current Bearer mode consistent with verification.
- Website sign-in and authenticated owner create/read are user-confirmed; the live SQLite database contains one protected user-created note. Test logout/refresh and browser reopen after restart separately. Callback + PKCE routing also passed with HTTP 303.
- Four users exist, only one linked admin. Let `guard2` and `guard3` enroll their own Tide accounts, then verify three actual distinct `realm-management/tide-realm-admin` holders. `guard4` can be a normal requester.
- Create/assign the exact document role via Tide Console; prove 0/2 → 1/2 stays denied, and 2/2 committed + refreshed requester succeeds only for that note.
- Reproduce forged/expired/wrong-client/wrong-document denials with real integration. Test fixtures with local signing keys are app logic/crypto evidence only.

See [the operational Vietnamese guide](TIDE_GUARDIAN_SETUP_VI.md), [current Step 5 report](STEP5_QEA_INTEGRATION_REPORT.md), and [Step 6 results/limitations](STEP6_CORE_FEATURES_REPORT.md).

## What the later Step 7 reviewer should validate

This is a handoff checklist, not a claim that Step 7 has run: browser/mobile/keyboard flows; real issuer/audience/client/role scope; refresh/revocation/sign-out; body absence from HTML/hydration/API/logs; user-isolated requests and duplicate/concurrent operations; actual distinct-Guardian approvals and no cross-document access; secret/artifact exclusions; persistence/recovery; dependency review and input/session hardening appropriate to the eventual deployment.

Known limits: synthetic data, plaintext server SQLite, single-server local scope, no E2EE claim, no DPoP support yet, no live three-Guardian proof, no completed containerized-auth or cloud deployment validation. Do not turn a successful build into a claim that these live security properties passed.

Save initially failed on NextRequest loopback-origin normalization; both write endpoints were fixed with regression coverage. The user then confirmed successful save/read. Remaining live acceptance: logout/refresh, two independent Guardian enrollments, and genuine 2-of-3 role-grant enforcement.

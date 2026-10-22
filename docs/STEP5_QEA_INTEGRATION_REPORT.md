# Step 5: current integration and live QEA gates

Checked 2026-10-22, Asia/Saigon. **PARTIAL: application code integrated; real multi-user QEA acceptance BLOCKED.**

## Preserved foundation

- `main` includes Step 4, the Step 6 specifications/dependencies and `origin/codex/step-5` (`d3e0ea2`) via merge `bc8e9b5`. Local Tailwind/Lucide UI is retained. Existing Git stashes preserve pre-merge local work.
- Docker Engine 27.2.0 responds. `securedocs-tidecloak` runs `tideorg/tidecloak-dev:latest`, bound to `127.0.0.1:8080`, with the existing `securedocs_tide_data` volume. No replacement realm/container/volume was created or reset.
- Realm `securedocs`, enabled Tide IDP and public client `securedocs-client` exist. Read-only authenticated inspection found one linked Tide user and one `realm-management/tide-realm-admin` holder. OIDC discovery responds.
- No bootstrap password, admin token, enclave link, private signing key or recovery information was written to project files. Bootstrap admin authentication was used for diagnostics/export and explicitly authorized setup proposals. Invalid/incompatible unapplied config drafts were superseded using Deny and replaced with correct proposals. The official approval preflight returned `needs-approval`; only the human user supplied enclave signatures. No signature, Guardian identity or protected-document grant was fabricated.

## Integrated application boundary

- `TideProvider`, sidebar Sign in/out, callback, silent-check page, account status, protected reader and request creation use the imported official SDK integration and current light UI.
- `.env.local` contains only public local URLs/realm/client identifiers and is ignored by Git.
- `tidecloak.json` was exported using the **Tide** endpoint `vendorResources/get-installations-provider`, not the ordinary Keycloak installation endpoint. It contains one embedded public JWK and public Tide adapter fields, and is ignored/excluded from builds. Ordinary Keycloak export was observed to omit `jwk`.
- Runtime configuration accepts only a matching public client, requires embedded public keys and excludes private key fields/client credentials from browser props. No missing-key fallback to remote JWKS is used by the application.
- The official server verifier checks signature, issuer, authorized party and time claims. The app additionally requires a non-expired Bearer access token, its own audience, no sender-bound `cnf`, and exact app-client roles. This implementation is Bearer-only; it does not claim DPoP proof support.
- Anonymous/invalid sessions cannot read protected bodies. Verified owners can read notes whose owner was assigned from their verified subject; others need the exact role. UI state changes never grant rights.
- Guardian review listing requires the **verified** `realm-management/tide-realm-admin` client role. Same-named realm roles do not grant review access. No management token is stored in the website or sent from its backend to enact grants.

## Role mapping and operator handoff

| Document | Client role |
|---|---|
| `patient-safety-brief` | `doc_read_patient_safety_brief` |
| `coastal-resilience-notes` | `doc_read_coastal_resilience_notes` |
| `funding-review-memo` | `doc_read_funding_review_memo` |
| New protected note | `doc_read_` + server-generated UUID without hyphens |

The server defines the mapping. The mapping does **not** prove those roles already exist in TideCloak: no app-client roles were returned by the initial live inspection. An operator must create/assign the exact role through governed console changes and ensure the app token includes its client roles.

The Guardian screen exposes recorded business requests and grant details only to verified admins. An admin follows the console link to propose the real role grant. Website requests stay PENDING in storage; requester-facing Available is derived from their currently verified permission. There is no app-local approve endpoint or quorum counter. Guardian tickets are not a live QEA inbox and do not prove a grant is still pending.

## Current live blocker

Client settings initially allow only the old `127.0.0.1:8080/securedocs-client` redirects/origin. The user prepared website origin `http://127.0.0.1:3000`, but read-only rechecks still showed the old effective settings. The exported adapter currently has `client-origin-auth-http://127.0.0.1:8080`, **not** an authorization for port 3000.

The user reported Bulk authorize: `0 succeeded, 7 failed`, with `[HEIMDALL] No approvals from the enclave within 300s`. Read-only `/iga/change-requests?status=PENDING` confirmed all seven remain PENDING, authorizationCount=0, threshold=1, readyToCommit=false: three CREATE_USER changes plus client mapper, attribute, origin and property changes. No under-quorum commit was attempted. Timeout means no enclave approval arrived; popup/storage blocking is a diagnostic possibility, not a proven sole cause.

Follow [the Vietnamese guide](TIDE_GUARDIAN_SETUP_VI.md). Allow the relevant site's popup, inspect and authorize **one understood request** in the real enclave, verify commit, sign updated IDP/origin settings through the official console flow, then re-export the adapter and restart the website. Do not reset the realm or substitute a headless approval.

## Gates for completion

### Follow-up after the user's approval

The old rootUrl-with-leading-space and incompatible DPoP proposals were not applied: they were denied/superseded, then correct client setup proposals were submitted. The user signed those and the three seed-role creations through the real enclave. Read-back confirmed clean rootUrl, both port-3000 redirects, Web origin 3000, PKCE S256, no active DPoP binding, the signed website origin in the re-exported adapter and all three seed client roles. The old port-8080 redirects were preserved.

OIDC authorization with the actual callback and S256 challenge returned HTTP 303, with no redirect/PKCE rejection. No credentials/login were automated by that probe. Website restarted successfully on loopback port 3000. Actual user login/notes/refresh still requires the user's browser acceptance.

`guard2`, `guard3`, `guard4` now exist. Read-back counted four realm users, **one linked Tide user and one Tide admin**. The three new users are unlinked and not admins. Two must enroll themselves and receive governed admin grants; the remaining user can be a normal requester. Do not claim three Guardians just because three local users exist.

| Gate | Current evidence |
|---|---|
| Container/realm/client exist | PASS on this host |
| App-side login/API/reader integration | Implemented; local checks recorded in Step 6 report |
| Effective app settings / role creation | PASS; clean 3000 callbacks/origin, S256 and three app roles read back after human approvals |
| Live website login/logout/session refresh | Sign-in and owner note save/read user-confirmed after write-origin fix; logout/session refresh NOT VERIFIED |
| Three distinct enrolled Guardian admins | BLOCKED; one linked admin verified; user has two additional humans awaiting setup |
| Effective quorum two | NOT VERIFIED; pending requests currently report threshold one |
| Role grant at 0/2 and 1/2 remains forbidden | NOT VERIFIED against real Tide |
| Second distinct approval commits; refreshed requester reads exact document | NOT VERIFIED against real Tide |
| Other protected document remains forbidden after real grant | NOT VERIFIED against real Tide |

Local tests with signed ephemeral fixture keys exercise the real verifier and app policy, **not** Tide enrollment or QEA. Do not label Step 5 complete until the live gates above pass.

Official references: [Setup QEA](https://docs.tide.org/Admin/SetupIGA), [QEA workflow](https://docs.tide.org/Core-Concepts/iga-workflow). Real Raziel requests succeeded for `verify-jwt-server-side`, `add-auth-nextjs-existing`, `setup-iga-admin-panel`, adapter-export canon and troubleshooting T-21/T-27. Runtime SDK declarations/source were inspected for the exact installed versions.

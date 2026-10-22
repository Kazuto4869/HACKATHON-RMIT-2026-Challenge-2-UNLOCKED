# STEP 4 implementation report — SecureDocs

Verified on 22 October 2026, Asia/Bangkok (UTC+7).

## Outcome

STEP 4 is implemented as the first Next.js application in this repository. The repository had no `package.json`, application source, installed project dependencies, or root `AGENTS.md` before this work. The app uses Next.js 16.4.2 App Router, React 19.3.1, and TypeScript.

The existing TideCloak realm and STEP 3 configuration were not changed. The application does not call a Tide SDK, decode an unverified JWT, create a role, or simulate QEA approval. Until a real TideCloak app client and verified server-side token adapter are added in STEP 5, every protected document read is denied by default.

## STEP 3 status verified before implementation

`docs/STEP3_ENVIRONMENT_REPORT.md` records STEP 3 as complete for environment and authentication readiness:

- realm `securedocs` is enabled;
- its Tide identity provider is enabled;
- one linked `tide-realm-admin` and an active Tide console session were verified;
- `securedocs-client` exists as a public OIDC client;
- a separate SecureDocs application-user login was not tested;
- three Guardians and the desired 2-of-3 QEA behavior remain unconfigured and untested.

The current Codex shell did not expose `docker` on `PATH`, so the running container was not re-verified in this step. No STEP 3 Docker volume, realm, client, user, session, or local secret was modified.

The requested root `AGENTS.md` was initially absent. Next.js 16 generated it on the first development run; its instruction to use the installed framework documentation was followed for route handlers, dynamic routes, and server/client boundaries. `Skills/AGENTS.md` applies to the separate `Skills/` subtree and that subtree was not edited.

## Implemented routes and screens

| Route | Result |
| --- | --- |
| `/` | Responsive document dashboard with four synthetic metadata records, lock/public status, owners, dates, and clear STEP 5 status. |
| `/documents/[id]` | Public document reader or locked state. Locked pages state that content was not delivered and disable the future request action. |
| `/notes/new` | Validated synthetic note form. A successful draft lives only in React page memory and is removed on refresh. |
| `/account` | Evidence-based TideCloak readiness ledger; no false signed-in state. |
| `GET /api/documents` | Safe metadata list only. |
| `GET /api/documents/[id]` | Public body for the public seed; `401` for protected seeds while app authentication is unavailable; `404` for unknown IDs. |

## Data and authorization boundary

- `src/domain/documents.ts` defines document, access-request, and verified-viewer contracts.
- `src/server/document-store.server.ts` is server-only and keeps metadata separate from bodies.
- `src/server/document-service.ts` checks metadata and authorization before calling the body store. It projects metadata onto an explicit safe shape so an accidental repository field is not serialized.
- `src/server/tide-authorization.ts` exposes the STEP 5 adapter interface: resolve a verified viewer, then decide whether that viewer may read a specific document.
- The STEP 4 adapter returns no viewer and denies protected reads. It contains no hardcoded success branch.
- The application request and Tide QEA grant workflow are intentionally not implemented. The locked action cannot create or approve a request.

The protected body is not read for an anonymous or policy-denied request. It is absent from document listings, denied API payloads, locked-page HTML, browser storage, and client components.

## Files added or changed

- Application: `app/`, `components/`, `src/domain/`, `src/server/`
- Tests: `tests/document-service.test.ts`, `tests/note-validation.test.ts`
- Tooling: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`
- Context and documentation: `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `README.md`, this report
- Ignore rules: `.gitignore`

`C2_STEP4_SECUREDOCS_CODEX_EXECUTION.md` was supplied as an untracked input and was not edited.

## Verification results

| Command/check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 9 tests, 2 suites, 0 failures. |
| `npm run typecheck` | PASS | TypeScript completed with exit code 0. |
| `npm run build` | PASS | Next.js 16.4.2 compiled, type-checked, generated six static pages, and registered all dynamic routes. |
| `npm audit --omit=dev` | PASS | 0 production vulnerabilities. |
| Final install audit | PASS | 0 vulnerabilities after removing the optional vulnerable lint toolchain. |
| `npm run lint` | NOT APPLICABLE | The repository had no lint baseline. Adding `eslint-config-next` introduced five high-severity development-only advisories with no non-breaking fix, so the optional toolchain and script were removed. |
| Production HTTP probe | PASS | `/api/documents` 200 with no body field; protected API 401 with no body; public API 200 with body; invalid ID 404; locked page 200 with protected body absent; all UI routes 200. |
| UI inspection | PASS | Codex in-app browser captured dashboard at 1440px and 390px, locked detail at 390px, and a completed note form at 1440px; no browser warnings or errors. Screenshots were inspected in-session and were not committed. |
| Impeccable detector | PASS | `impeccable.cmd detect --json app components` returned `[]`. |

The production build is left running at <http://127.0.0.1:3122/> for handoff (process ID recorded at launch: 26068). That process is local only and may end with the Codex host session.

## Demo walkthrough

1. Open the dashboard and compare a restricted record with the public sharing charter.
2. Open **Patient safety brief**. Confirm the screen says “Content not delivered,” and the access button is disabled for STEP 4.
3. Request `/api/documents/patient-safety-brief` directly. It returns `401` without a `body` field.
4. Open **Responsible sharing charter**. Its synthetic public body renders and its API returns `200`.
5. Open **Create note**, enter synthetic data, and create the demo draft. Refresh to demonstrate that no persistence is claimed.
6. Open **Account status** to show exactly which TideCloak prerequisites are verified and which belong to STEP 5.

## STEP 5 dependencies — not implemented here

1. Obtain the real application client configuration for the existing `securedocs` realm without committing it.
2. Integrate the official `@tidecloak/nextjs` provider and server verification flow using the installed-version documentation; preserve redirect URIs and the existing realm.
3. Enroll three distinct `tide-realm-admin` identities and verify the actual QEA threshold and governance behavior.
4. Define document-specific TideCloak reader roles and map verified token claims to document IDs in the authorization adapter.
5. Prove one approval leaves the grant unapplied, a second distinct approval commits it, and refreshed requester claims change the server response from denied to allowed.
6. Consider Tide E2EE separately if confidentiality from the application/database operator is required; QEA role governance alone does not establish encryption at rest.

No Guardian approval, quorum count, role grant, authenticated requester, or protected-content allow case is claimed by this report.

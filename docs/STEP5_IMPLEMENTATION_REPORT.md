# STEP 5 implementation report — SecureDocs

Verified on 22 October 2026, Asia/Bangkok (UTC+7).

## Outcome

The STEP 5 application boundary is implemented on branch `codex/step-5` using the existing Next.js App Router architecture. SecureDocs now uses the official `@tidecloak/nextjs` package for browser authentication and its server verifier for JWT validation. Each restricted synthetic document has one explicit TideCloak client role, and protected bodies remain server-only until both token verification and that document-role check succeed.

The application-side **Request access** flow is truthful: it records only an in-memory `PENDING` request. It does not assign a Tide role, call an invented SDK method, claim Guardian approval, or bypass QEA.

Live authentication, two additional Guardian enrollments, and the real 2-of-3 QEA grant could not be completed in this run. WSL and Docker Desktop now run, but this engine has no SecureDocs container or volume. The user authorized a replacement realm after confirming the original data is lost, then requested that only non-realm STEP 5 work be pushed to a separate branch. No replacement container, realm, or volume was created.

## Execution-plan gates

| Phase | Status | Actual evidence |
| --- | --- | --- |
| 5A — inspect and protect state | BLOCKED | Repository, branch, reports, Node/npm, SDK, WSL and Docker engine were inspected; both Docker contexts have no containers and no volumes, and the STEP 3 Windows profile is absent. A replacement realm was authorized but deferred while the non-realm branch is pushed. |
| 5B — TideCloak authentication | BLOCKED | Official provider, redirect route, silent-check page and fail-closed UI are implemented; the preserved realm/client is unavailable for actual adapter download and live requester sign-in. |
| 5C — document authorization | BLOCKED | Server verifier, exact client-role mapping, 401/403/200 service branches and negative live API probes are implemented/tested; a real verified requester token is still required for the live 403/200 gate. |
| 5D — three Guardians | BLOCKED | No additional Guardian was enrolled or impersonated. Two distinct humans and the original realm or an explicitly authorized replacement are required. |
| 5E — request and QEA grant | BLOCKED | The app-only `PENDING` workflow is implemented; no Tide role proposal, approval, grant, or QEA request ID is claimed. |
| 5F — end-to-end release proof | BLOCKED | Tests, typecheck, build, audit, negative API checks and UI failure-state checks pass; the required real denied-to-allowed QEA demonstration remains blocked by 5A/5D. |

STEP 5 is therefore not marked complete. The independently executable code work is complete; the remaining gates are interactive and depend on the restored TideCloak environment.

## Repository and STEP 3/4 baseline

- The work started from the existing STEP 4 branch and preserved the user's untracked `C2_STEP4_SECUREDOCS_CODEX_EXECUTION.md`.
- `docs/STEP3_ENVIRONMENT_REPORT.md` records realm `securedocs`, public client `securedocs-client`, and one linked `tide-realm-admin` as verified during STEP 3.
- STEP 3 did not verify a separate application requester, three Guardians, or a 2-of-3 governed grant.
- The STEP 4 baseline passed 9 tests before STEP 5 changes.
- Existing synthetic documents, note flow, responsive layout, server repository boundary, and public metadata API were retained.

## Official Tide sources used

The workspace Raziel MCP remains configured at `https://mcp.tide.org/mcp`. Its playbook discovery call succeeded and exposed the official Next.js authentication, RBAC, route protection, API protection, JWT verification, admin initialization, and IGA setup playbooks. A later attempt to refresh individual playbooks was blocked by the AGY CLI's expired Google authentication, so no result from that failed refresh is claimed.

Implementation was cross-checked against:

- [TideCloak Next.js tutorial](https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-tutorial)
- [TideCloak Next.js how-to guide](https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-how-to-guide)
- [TideCloak Next.js reference](https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-reference)
- [Server-side JWT verification](https://docs.tide.org/Languages/NextJS/VerifyJWT)
- [IGA administration setup](https://docs.tide.org/Admin/SetupIGA)
- [IGA/QEA workflow](https://docs.tide.org/Core-Concepts/iga-workflow)
- The installed `@tidecloak/nextjs@0.14.40` package declarations and server implementation.

No undocumented Tide SDK method is used.

## Implemented authentication and authorization

### Browser authentication

- `TideCloakProvider` wraps the existing application only when all public adapter values validate.
- `/auth/redirect` and `/silent-check-sso.html` implement the documented redirect and silent-session paths.
- Header and account controls expose only actual SDK states: checking, signed out, signed in, or unavailable.
- When the local identity server cannot be reached, the UI reports sign-in unavailable and the restricted reader stays locked.

### Server JWT boundary

- Protected APIs call the package's real `verifyTideCloakToken` function.
- The access token comes from `Authorization: Bearer ...`; the documented `kcToken` cookie is a fallback only when no Authorization header is present.
- A malformed Authorization header fails closed instead of falling back to a cookie.
- The viewer is created only from verified claims with a non-empty `sub`.
- The verified claims must describe a non-expired Bearer access token. ID-token-shaped, missing-expiry, expired, and sender-bound DPoP claims are denied by this Bearer-only API.
- Authorization uses only `resource_access[securedocs-client].roles`; same-named realm roles are ignored.
- Verification exceptions and rejected tokens resolve to anonymous access.
- Responses carrying authorization decisions use `Cache-Control: private, no-store` and vary on `Authorization` and `Cookie` in addition to Next.js routing headers.

### Document-role mapping

| Restricted document | Required client role |
| --- | --- |
| `patient-safety-brief` | `doc_read_patient_safety_brief` |
| `coastal-resilience-notes` | `doc_read_coastal_resilience_notes` |
| `funding-review-memo` | `doc_read_funding_review_memo` |

Unknown or public document IDs do not receive an implied protected role.

### Request access

- `GET /api/access-requests?documentId=...` returns only the signed-in requester's matching request.
- `POST /api/access-requests` accepts only a known restricted document and returns `202` with `PENDING`.
- Requests are idempotent per requester/document while the server process lives.
- There is no application endpoint that changes a request to granted or mutates TideCloak roles.
- UI copy explicitly says a pending app request is neither a role grant nor Guardian approval.

## Deny-by-default behavior

- Restricted page rendering reads metadata with a null server viewer and never server-renders the body.
- The browser receives a protected body only from a later successful protected API response.
- A readable client state is tied to the exact SDK token that fetched it; a sign-out or token change hides that body before the next fetch resolves.
- Anonymous and invalid-token responses contain no `body` property.
- Missing or invalid configuration selects a deny-all adapter.
- Public synthetic content remains readable without authentication.
- The access-request store contains requester IDs and document IDs only; it never stores protected content.

## Verification results

| Check | Result | Evidence |
| --- | --- | --- |
| Baseline tests | PASS | 9 tests, 2 suites, 0 failures before STEP 5 edits. |
| STEP 5 tests | PASS | 23 tests, 5 suites, 0 failures, including token-type and sender-bound rejection. |
| TypeScript | PASS | `npm run typecheck` exited 0. |
| Production build | PASS | Next.js 16.4.2 compiled, type-checked, generated static pages, and registered all application/API routes. |
| Dependency audit | PASS | `npm audit --omit=dev` reported 0 production vulnerabilities. |
| Anonymous protected API | PASS | `GET /api/documents/patient-safety-brief` returned 401, no `body`, `private, no-store`, and `Vary` included Authorization/Cookie. |
| Forged-token protected API | PASS | An invalid compact JWS returned 401 with no `body`; the verifier logged only `Invalid Compact JWS`, not the token. |
| Public API | PASS | `GET /api/documents/sharing-charter` returned 200 with its synthetic public body. |
| Unknown document | PASS | Returned 404 with no body field. |
| Anonymous access request | PASS | Returned 401 with no request object. |
| UI runtime | PASS | Dashboard rendered; after the real SDK connection failed, header showed “Sign-in unavailable” and the restricted reader showed “TideCloak session initialization failed” while remaining locked. |
| UI detector | PASS | `impeccable.cmd detect --json app components` returned `[]`. |
| Live signed-in 403/200 transition | BLOCKED | Requires the preserved TideCloak realm, a requester token, document roles, and Guardian-controlled grant. |
| Three Guardians and 2-of-3 QEA | BLOCKED | Requires Docker/WSL and two people to complete their own enrollment/approval interactions. |

The role-denied and role-allowed branches are covered with injected verified claims in unit tests. This report does not present those controlled tests as live TideCloak or QEA evidence.

## Current TideCloak data blocker

Docker Desktop 29.9.2 is installed at `C:\Users\Duy Anh\AppData\Local\Programs\DockerDesktop`. Initially WSL was unavailable and Docker's Linux pipe was absent. After the user installed WSL, `wsl.exe --list --verbose` showed Ubuntu and `docker-desktop` running as version 2, and `docker version` showed Docker Desktop Server 4.96.2 and Engine 29.9.2.

Read-only `docker ps -a` and `docker volume ls` returned no containers and no volumes in `desktop-linux`. The `default` context also returned no containers. Initially `docker image ls` returned no images, and port 8080 had no listener. After the user authorized a replacement, the official `tideorg/tidecloak-dev:latest` image was pulled locally (digest `sha256:3f52d0bc3e4e3ae5153e172960003bbe94705cd40af6561fd4c7c4434aaa2708`); no container or volume was created. `docs/STEP3_ENVIRONMENT_REPORT.md` shows that STEP 3 used Docker Desktop 4.34.3, Engine 27.2.0, and Windows user profile `C:\Users\LENOVO`; the current host uses profile `C:\Users\Duy Anh`, and `C:\Users\LENOVO` does not exist here. The user confirmed that the old machine/backup data is no longer available. The old `securedocs-tidecloak` container and `securedocs_tide_data` volume cannot be restored from this environment.

Creating a fresh `securedocs` realm under the same names would not preserve the STEP 3 realm. The user approved this replacement but asked to push only non-realm work now. No container, volume, or replacement realm was created; no realm data, credentials, or downloaded adapter is included in the branch.

## Required interactive continuation

1. Replacement of the lost realm is authorized but deferred. When environment work resumes, create a new named volume and `securedocs-tidecloak` container, complete the official bootstrap wizard, and label the new realm as a replacement STEP 5 environment, not recovered STEP 3 state.
2. Once an authoritative realm is online, confirm the actual `securedocs-client` adapter and configure exact `http://127.0.0.1:3000` redirect and web origins through its governed console flow.
3. The user must personally complete login and two additional Tide account enrollments. Credentials, MFA, passkeys, and Guardian consent will not be automated.
4. In the Tide console, create the three document client roles if absent and propose one role for a separate requester. With three distinct `tide-realm-admin` Guardians, verify that one approval remains pending and a second distinct approval commits the grant.
5. Refresh/re-authenticate the requester so the access token carries the new client role, then repeat the API check: before grant 403/no body; after the real quorum grant 200/body only for the matching document; wrong document still 403.

No STEP 6 encryption or storage work was implemented. QEA role governance is not described as encryption at rest or protection from the application/database operator.

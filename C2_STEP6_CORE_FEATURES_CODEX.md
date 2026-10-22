# RMIT Hackathon 2026 — C2 SecureDocs
## STEP 6 — Core Features and End-to-End Integration (Codex Execution)

**Mission:** Turn the existing SecureDocs prototype into a coherent, testable document-sharing MVP showing real TideCloak-governed permission grants. Work in the existing repository, not a new project. Do not claim integration is functional before testing it.

### First: inspect actual state

- Read `AGENTS.md`, `README.md`, `package.json`, any Step 3/4/5 reports and the real source files. Inspect `git status` before edits; preserve all existing changes.
- Read actual Tide Raziel MCP playbooks and official Tide docs before SDK calls. References: https://docs.tide.org/Core-Concepts/iga-workflow and https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-intro .
- Identify which Step 5 gates have genuinely passed. If QEA is blocked by human enrollment, report that clearly; continue implementing independent app functionality but DO NOT add a fake approval substitute.
- Confirm framework, routes, package manager, existing login/session integration, persistence and authorization boundaries. Follow existing conventions.

### Product contract

User roles:
- **Owner:** create and list own notes; see private content of own notes where a real verified owner authorization path exists.
- **Requester:** see safe metadata, request read access, see request state and read a document only after the associated Tide role has been granted and the current authenticated authorization state has been verified.
- **Guardian:** one of three distinct `tide-realm-admin` identities; approve *governed role changes* through real Tide QEA, not app-local mock approvals.

Core trust story: for 3 Tide realm admins, the published default QEA quorum is 2. One approval must not apply a document-read role; two distinct approvals allow Tide to commit the change. The application must check document-level authorization server-side. Do not claim approvals occur for every note open.

### Core features — implement in priority order

**F1 — Real sign-in and sign-out (P0)**
- Preserve/complete existing TideCloak login, sign-out and refresh behavior using actual supported SDK APIs.
- Show authenticated identity and loading/error states; unauthenticated protected API reads return 401.
- Do not fake logged-in UI or trust user IDs from a request body.

**F2 — Create and list synthetic notes (P0)**
- Implement `title`, `summary`, `body`, `ownerId`, `createdAt` and `isProtected`; use existing datastore, or small server-side persistence if missing. Prefer SQLite if compatible with existing stack; never put real protected content in localStorage or public client bundles.
- Authenticated owner can create and list their notes; create form validates required fields and reasonable lengths.
- Requester can see only permitted metadata; never include protected body in list responses.
- Provide 2–3 safe synthetic seed notes, e.g. Confidential Research Plan, Team Contract, Scholarship Committee Notes.

**F3 — Document lock and backend authorization (P0)**
- Implement authoritative server-side `canReadDocument(user, doc)` using a verified Tide-issued identity and document-specific role/permission.
- Use explicit role-to-document mapping such as `doc_<stable_id>_reader`; actual role creation and token placement must come from inspected Tide configuration, not guessed SDK calls.
- A requester without access gets 403; an unauthenticated client gets 401. A forged role, hand-edited client state, invalid token, other-document role, and direct API request must not unlock the note.
- Ensure HTML, React hydration data, logs and error payloads never leak protected note bodies.

**F4 — Request Access workflow (P0)**
- Requester clicks Request Access; record a pending request with document ID, verified requester identity, creation time and idempotency (no duplicate active requests).
- Request is a *business request*, never itself a Tide permission grant. Show pending/status UI, and operator handoff to a real Tide-governed role-grant action.
- Prefer Tide console as approval UX for MVP. Do not write custom quorum counters or app-local `approved=true` as proof of permission.
- If accessible official Tide APIs exist for reading QEA request status, use them according to documentation. Otherwise show honest status (`Awaiting administrator review`, `Refresh access`) and a Tide Console link rather than an invented live 1/2 counter.

**F5 — Real Tide QEA grant bridge (P0; depends on Step 5)**
- Reuse verified Step 5 integration and enrolled 3 `tide-realm-admin` identities.
- Ensure an authorized operator can initiate the actual role grant through Tide Admin/Tide Console, producing the governed `PENDING` change; only Tide QEA commits it.
- Test 0/2 => forbidden; 1/2 => still forbidden; 2/2 => role granted => refresh session/claims => permitted for exact document.
- If setup requires interactive browser enrollment, licenses or approvals, show the specific manual sequence and preserve a blocked status. Never fabricate results.

**F6 — Secure reader (P0)**
- After Tide-granted authorization, show document body in a responsive reader with clear owner/requester information.
- Support error/expired-session states and a `Refresh access` / re-login path.
- Requester may view only the document whose role was approved, not every private note.

### Suggested routes (adapt to actual Next.js repo)

- `/` landing / auth state
- `/documents` dashboard
- `/documents/new` create note
- `/documents/[id]` protected document detail
- `/requests` personal requests and statuses
- `GET /api/documents` metadata only
- `POST /api/documents` authenticated create
- `GET /api/documents/[id]/content` server-authorized body
- `POST /api/documents/[id]/access-requests` authenticated idempotent request
- `GET /api/access-requests` current user's requests

Do not force these exact paths if equivalent routes already exist.

### Security and integration constraints

- Use existing TideCloak SDK and official Next.js verification guidance; do not trust decoded-but-unverified JWTs. Check issuer/audience/expiry/signature and role provenance according to Tide docs.
- Keep the app's document ID → Tide role mapping server-side.
- Never use a global `approved_researcher` role if it unlocks unrelated documents.
- Never let a user submit another person's identity for role assignment without authorization.
- Never automatically grant rights when creating a request, receiving a callback without verification, or clicking a Guardian UI button.
- Protect role-grant admin credentials; do not expose sensitive tokens in frontend, logs, examples or Git.
- Synthetic data only. E2EE is outside Step 6 unless previously correctly implemented and verified.
- Preserve working login and Step 5 code. Avoid unrelated refactoring, extra dependencies, PDF upload, chatbots, real-time coediting or custom approval cryptography.

### Implementation sequence and gates

1. **Audit:** inspect repo, reports, Tide MCP/doc references, actual auth/QEA readiness. Output observed PASS/FAIL/BLOCKED gates.
2. **Data + routes:** implement server-side note records, metadata-only listing, create flow and reader endpoint with deny-by-default policy.
3. **App UX:** dashboard, create form, locked detail, request state and authorized viewer; responsive, clear loading/error/empty states.
4. **Tide integration:** wire verified document roles and token/session refresh. Reuse actual QEA workflow, do not substitute a mock.
5. **Tests:** add/run authorization unit and API tests; run lint/typecheck/build scripts available in repo. Use a real app/browser test if supported; describe manual verification where it isn't.
6. **Handoff:** create `docs/STEP6_CORE_FEATURES_REPORT.md` listing changed files, feature evidence, test commands/results, Tide/QEA real-world status, remaining blockers and demo instructions. Update README only as necessary.

### Required negative and positive tests

| Case | Expected |
|---|---|
| Unauthenticated protected content fetch | HTTP 401 |
| Authenticated requester, no reader role | HTTP 403 |
| Wrong document-specific role | HTTP 403 |
| Request created | No new read permission; still HTTP 403 |
| Tide QEA pending after one Guardian approval | Still HTTP 403 |
| Tide QEA commits after two *distinct* Guardian approvals | Role updated in Tide; after verified session refresh, HTTP 200 for approved document |
| Other protected document | HTTP 403 |
| User tries changing client state or forging role | Cannot obtain body |
| Repeated Request Access click | No duplicate active request |
| Invalid/expired token | Denied or reauthenticated |

When real multi-user QEA approval cannot be completed, explicitly mark the last three related end-to-end assertions as **BLOCKED / NOT VERIFIED**. Automated unit tests with mocks may be labeled as tests of app logic only, never proof that Tide QEA worked.

### Done criterion

- Working Tide-authenticated SecureDocs MVP with real note create, list, access request, locked read, authorized read and correct server-side checks.
- Step 5 integration reused without bypass.
- 0/2, 1/2, 2/2 live acceptance cases verified wherever credentials and Tide setup permit.
- Build and relevant tests completed or exact blockers recorded.
- `docs/STEP6_CORE_FEATURES_REPORT.md` created and truthful.

**Start execution now in the current repository. Do not ask for design clarification. Request human action only when needed for real credentials, Google/Tide enrollment, or Guardian approvals. Stop before Step 7 (security hardening/final submission).**

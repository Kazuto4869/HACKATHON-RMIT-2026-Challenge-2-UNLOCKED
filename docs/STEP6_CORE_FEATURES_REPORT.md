# Step 6: core features and local integration

Checked 2026-10-22, Asia/Saigon. **Application implementation verified; overall Step 6 PARTIAL until remaining session checks and three-Guardian QEA acceptance pass.** Render is deferred by the user. Step 7 has not been performed.

## Integrated functionality

| Feature | Implementation / evidence | Live acceptance |
|---|---|---|
| F1: sign in/out and session refresh | Official Tide provider, callback, silent-check page, sidebar controls, account state and refresh actions; token verification boundary tested | Website sign-in and owner create/read user-confirmed; logout/refresh NOT VERIFIED |
| F2: create/list notes | Authenticated POST; owner from verified subject; server-side validation; protected/public visibility; SQLite persistence; metadata-only listing; own-note API filter | Storage/owner checks PASS in tests; live authenticated browser create/read user-confirmed |
| F3: document authorization | Embedded public JWK, real SDK signature/issuer/client verification, app audience and Bearer/expiry checks; exact app roles or verified ownership; protected bodies not server-rendered | Negative HTTP probes PASS; real requester 403/200 awaits Tide login |
| F4: access requests | Persistent timestamped requests, unique per requester/document, requester-scoped list, real permission-derived Available state; Guardian-scoped read-only handoff | Persistence/isolation/idempotency tests PASS; live authenticated Request Access remains unverified |
| F5: QEA grant bridge | Verified admins see requester/document-role details; actual grants/approvals happen in Tide Console, not in website | BLOCKED: enroll three admins and complete real quorum grant |
| F6: reader | Public reader and token/document-bound protected reader, loading/error/expired-session states, refresh/re-login; no protected body in unauthorized HTML/API | Public and negative probes PASS; real authorized reader awaits grant |

## UI preserved

The approved React/Tailwind/Lucide website retains its light palette, 220px desktop sidebar, three navigation items and responsive 3/2/1-column document grid. Cards contain only title, one-line summary and Available/Pending/Locked badge. Search examines metadata only. No fake Guardian identities, local approve button or invented 1/2 counter was added.

New Note now saves to the server instead of creating a disposable page-memory draft. Failed saves retain the form text. Shared Requests uses authenticated data. The Guardian queue is gated by the server's verified `realm-management/tide-realm-admin` role; a same-named realm role does not suffice. Grant details are shown only in that admin queue, behind a disclosure.

## Data and authorization

- `.data/securedocs.sqlite` stores notes and business requests. SQLite WAL/busy timeout supports local concurrent connections. Seeds are inserted without replacing existing rows. Database/journal files are ignored by Git and excluded from image/standalone traces.
- `ownerId` is taken from a verified token, never from user JSON. Owners may read their own notes; other users require the mapped client role. Public notes are intentionally public.
- Mapping is server-defined: three existing seed roles, or `doc_read_` plus the server-generated UUID without hyphens for new notes. An operator must create/assign the corresponding real Tide role; mapping alone does not create it.
- Request storage accepts only PENDING. There is no local grant mutation. Requester-facing GRANTED/Available is computed from the current verified permission, not stored approval. Guardian tickets are recorded requests, not authoritative live QEA status.
- The downloaded Tide adapter is local and gitignored. Runtime requires matching realm/client and embedded public JWKs, omits client credentials/private JWK material from browser props, and fails closed if missing/invalid.
- Missing/invalid token gives 401; verified identity without document permission gives 403; exact authorized read gives content. Authenticated responses use private/no-store caching headers and vary on Authorization/Cookie.
- This is a **Bearer-only** integration. Sender-bound `cnf`/DPoP tokens are rejected, not silently accepted without proof. A pending console change enabling DPoP has not been committed by Codex. Supporting DPoP must include real proof verification before enabling that configuration.
- SQLite bodies are plaintext on the server. No E2EE, operator-confidentiality, production deployment, multi-instance store, or Step 7 hardening claim is made. Use synthetic data only.

## Routes

| Route | Behavior |
|---|---|
| `/` | Searchable metadata cards and verified access/request badges after SDK initialization |
| `/notes/new` | Authenticated create form |
| `/documents/[id]` | Safe metadata, public reader or authenticated protected API reader |
| `/requests` | Current user's requests/statuses |
| `/guardians` | Console handoff and server-authorized admin request queue |
| `/account` | Actual SDK sign-in state and adapter readiness |
| `/auth/redirect`, `/silent-check-sso.html` | SDK callback/session support |
| `GET /api/documents` | Metadata plus permission-derived status, never body |
| `GET /api/documents?mine=1` | Authenticated owner's metadata |
| `POST /api/documents` | Authenticated validated create; safe metadata response |
| `GET /api/documents/[id]` | Existing authoritative public/protected content endpoint |
| `GET /api/access-requests[?documentId=...]` | Current user's request(s) |
| `GET /api/access-requests?scope=guardian` | Verified Tide admin only; review/grant details |
| `POST /api/access-requests` | Authenticated, idempotent business request; no permission change |

## Verification actually executed

| Check | Result |
|---|---|
| Node/npm | v24.11.0 / 11.6.1 |
| `npm test` | PASS: 32 tests, 0 failures |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; current host build uses normal Next output; Docker opts into standalone |
| `npm run verify:step6` | PASS on local HTTP: metadata only, public 200, anonymous/forged-header/forged-cookie 401, unknown 404, unauthorized create/request/admin queue 401, seven UI routes 200 with protected seed body absent, silent-check page 200 |
| Real SDK cryptographic verification | PASS with ephemeral **local test keys**: valid fixture accepted; altered signature, wrong issuer/client/audience, expired and ID-token-shaped fixtures denied |
| SQLite reopen test | PASS: note/request survive close/reopen; metadata excludes body; requests isolated/idempotent; requester still denied; verified owner reads |
| `npm audit --omit=dev` | PASS: 0 production vulnerabilities at check time |
| `docker build --check .` | PASS for Dockerfile syntax/configuration; no completed image build or containerized auth claimed |
| Ignore rules | `.env.local`, `tidecloak.json`, `.data/securedocs.sqlite` confirmed ignored |
| Live Tide requester/QEA grant | BLOCKED / NOT VERIFIED; local test signatures are not Tide/QEA evidence |
| OIDC callback + PKCE routing | PASS: actual callback + S256 authorization request returned 303; no credentials/login automation |
| Render deployment / Step 7 | Deferred / not performed |

Node 24.11 emits an experimental warning for built-in SQLite. This warning is recorded, not suppressed. No rendered browser/mobile visual acceptance is claimed for this integrated pass; the browser connector was unavailable earlier in the session.

## Live environment and remaining blockers

The original TideCloak container/volume still run on this host. One linked Tide admin was verified. The user has two other people available, but their enrollment/admin grants and 2-of-3 behavior have not been verified.

Initially seven requests were PENDING with zero signatures and the user reported `[HEIMDALL] No approvals from the enclave within 300s`. After the user's successful approval, the web origin `http://127.0.0.1:3000` became effective and the re-exported adapter includes that signed origin. This is real progress, not a completed website login.

Those conflicting client drafts were subsequently inspected and superseded: the leading-space rootUrl and incompatible DPoP proposal were denied rather than committed. Correct rootUrl/redirect/PKCE proposals and three seed-role creation proposals were prepared automatically. Calling the official approval endpoint returned `mode=needs-approval`, authCount=0, threshold=1, proving the enclave-signature step was required. The user supplied those signatures; read-back then confirmed all six desired changes actually applied. No approval signature or role grant was fabricated.

**Current effective setup:** clean rootUrl `http://127.0.0.1:3000`, both 3000 callbacks, the existing 8080 redirects preserved, Web origin 3000, PKCE S256, Bearer mode, three seed client roles and a freshly exported public adapter with signed website origin. Callback/PKCE routing returned 303. The local website was restarted successfully. The prior `PENDING_CHANGE_REQUEST_CONFLICT` is historical, not the current app-setting blocker.

Four local users now exist. Only the original user is linked to Tide and holds the admin role; `guard2`, `guard3`, `guard4` are unlinked non-admins. Two should enroll as additional Guardians, while another can be a normal requester. This enrollment and the real grant test remain the live blockers.

Next manual work:

1. Website Sign in/create/read at `http://127.0.0.1:3000/` are user-confirmed. Still test Sign out, sign back in, Refresh access and reopening the saved note after a server restart. Settings/adapter have already been completed; do not re-create those proposals.
2. Keep token mode consistent with implemented verification. Do not enable DPoP without proof handling or reset the existing realm/data.
3. Let `guard2` and `guard3` enroll their own Tide identities, grant `realm-management/tide-realm-admin` through real QEA, and verify three distinct linked admin identities and the actual quorum for a fresh grant. `guard4` can be the normal requester.
4. Follow [the Vietnamese guide](TIDE_GUARDIAN_SETUP_VI.md) for requester and Guardian A/B. Record live 0/2 denied, 1/2 denied, 2/2 committed + refreshed requester 200 for the exact note, and other-note 403.

Do not mark Step 5/6 or the overall goal complete before those live assertions are actually observed. [Current Step 5 evidence](STEP5_QEA_INTEGRATION_REPORT.md) and [Step 1–6 review handoff](STEP1_6_REVIEW_HANDOFF.md) distinguish code checks from real-world acceptance.

### Browser write-origin regression fixed

The user confirmed website sign-in, then reported `Cross-origin writes are not allowed` when saving. Reproduction with the installed `NextRequest` showed `http://127.0.0.1:3000` becomes `http://localhost:3000` internally while the browser Origin remains unchanged. Both write routes now compare Origin with the configured public application origin, never forwarded/Host headers. Two regression tests verify the real NextRequest normalization and rejection of other origins. Tests (32), typecheck and production build pass. Server restarted; the user subsequently confirmed successful save and read in the actual browser. Sign-out/refresh and three-Guardian quorum remain unverified.

Browser acceptance follow-up: the user confirmed successful save and read after the local origin fix. The live SQLite database independently contains one protected user-created note. This confirms the owner flow; it does not establish another user's entitlement, logout/refresh, or 2-of-3 QEA.

Current blocker recheck: local website returns HTTP 200; guard2 and guard3 remain unlinked non-admins; only the original account is a linked admin; zero QEA requests are pending. Private enrollment invitations were generated in ignored `.data/guardian-enrollment.private.html`. No queued approved change is available for automatic commit. The two people must finish enrollment before Guardian grants and a genuine 2-of-3 test can proceed.

Enrollment subsequently failed in the hosted enclave with the exact error: `Could not reach enough NEW ORKs (got 2 of 20 required, 18 of 20 failed)`. This is a Fabric account-creation failure, not the Guardian approval threshold. The home ORK root returned HTTP 200 from the local machine, which does not establish that all enrollment operations or other ORKs are healthy. Browser request domain/status evidence is required to distinguish network blocking, timeout and upstream rejection. Do not lower thresholds, reset the realm, or reuse one Tide identity for multiple Guardians. Existing independent Tide accounts may be linked through the enrollment flow, but that route also depends on Fabric availability and has not been tested here. Enrollment-session URLs must not be copied into reports or Git.

The user supplied the actual ORK ProblemDetails: HTTP 403, `TIDE-ORK-VOUCHER-ACTION_NOT_ALLOWED`, detail stating that the subscription has exceeded its total user count. This establishes a quota rejection for that request, not a connectivity failure. The local license endpoint reports `currentUserAcc: 5` while the realm lists four users; these are different counters, and deleting a realm-only user is not proof of reclaimed Fabric quota.

User now requests exactly three users: retain the existing linked admin and `guard2`, `guard3`; remove `guard4`. A governed DELETE for unlinked `guard4` returned HTTP 202 and created QEA request `b96504b1-67e3-4ed6-bfd5-0c8d5139021a` (`DELETE_USER`, not ready to commit). All four users still exist until the user authorizes it. Do not create a replacement requester account; an enrolled Guardian may also exercise the requester flow without being granted a document-reader role automatically.

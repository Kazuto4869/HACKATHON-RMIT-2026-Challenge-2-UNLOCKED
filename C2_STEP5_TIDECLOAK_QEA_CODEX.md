# C2 — Step 5: Real TideCloak QEA Guardian Approval

**Project:** SecureDocs — Guardian-Protected Document Sharing  
**Mode:** Codex execution specification; reuse existing Git repository, do not scaffold a new one.  
**Scope:** Actual 2-of-3 QEA-governed document-reader **role grant** and server-side enforcement.  
**Precondition:** Step 3 TideCloak/login functional; Step 4 document dashboard, locked-content API and data model reviewed. Do not assume those stages passed without evidence.

## 1. Success definition

A user without `doc_<id>_reader` role cannot read document `<id>`. A designated TideCloak admin proposes granting that role to the user. With **three active `tide-realm-admin` identities** in a non-master QEA realm, the change is **PENDING** after zero and one approval; only a second **distinct** valid admin approval lets Tide commit the role change. Following a token/session refresh, **the same server endpoint** allows reading document `<id>` but still rejects unrelated protected documents.

**Critical distinction:** This flow governs **permission changes**, not a separate Guardian decision on every `GET`. App request tickets are business metadata, not cryptographic authorization. A UI approval counter is not evidence that Tide QEA completed.

**Built-in threshold** reported by Tide documentation: `max(1, floor(0.7 * N))`; at N=3, two signatures. QEA is not applied to the `master` realm. Do not use two admins for this demo: the documented default still requires just one approval.

## 2. Sources to consult via Tide Raziel MCP (and official docs)

- https://docs.tide.org/Core-Concepts/iga-workflow
- https://docs.tide.org/Admin/SetupIGA
- https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-intro
- https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-discussion
- https://docs.tide.org/Admin/e2ee (optional later, not Step 5 prerequisite)

Tide documentation notes that **multiAdmin** approvals pass through the Tide **enclave**. Do not issue naive REST approval calls pretending to be Guardians; use the documented Tide Console and real authorized human accounts.

## 3. Step-by-step execution plan

### Phase 0 — Verify foundations (Codex, no destructive actions)

1. `git status --short`: inspect files and preserve all existing work.
2. Read the actual Step 3 status report and Step 4 implementation report, package.json, Tide SDK configuration, routes and API tests. Report missing docs honestly; inspect source directly as fallback.
3. Verify Docker Engine and running TideCloak container, the actual non-master realm, Tide IdP/license/enrollment, and Next.js auth/session behavior. Check Raziel MCP tool access where available.
4. Confirm existing document ID / owner / backend content API and where backend verifies signed Tide tokens.
5. If any foundation is missing, fix only minimal blockers within agreed scope; request user action for interactive sign-in/enrollment rather than faking success.

**Gate 0:** Known-running Tide realm and verified login or explicit BLOCKED status with reproducible commands.

### Phase 1 — Identity / role model

1. Select **one** synthetic protected note for demo; choose a document-specific reader role, e.g. `doc_research_notes_reader` (actual name from verified realm configuration, not hardcoded guesses).
2. Verify 3 **distinct** users have `tide-realm-admin` in a **non-master** Tide QEA realm. Do not count ordinary users or UI guardian labels.
3. Document initial bootstrap of the admins. Admin role grants during bootstrap may themselves be governed changes; guide user through official Tide Console and enclave approval flows.
4. Verify realm licensing, supported QEA mode and actual quorum as shown by the Tide Console. Record non-sensitive evidence (admin counts, state; not secret tokens).
5. Establish the requester as a normal Tide-authenticated account with **no document role**.

**Gate 1:** 3 admin identities independently verified; QEA quorum 2. If only one/two admins exist, **STOP** and mark the quorum demo blocked rather than silently lowering threshold.

### Phase 2 — App access boundaries (Codex)

1. Use official TideCloak Next.js SDK and token-verification guidance already installed; never invent SDK helpers.
2. On `GET /api/documents/:id/content` (or actual existing equivalent), verify signature, issuer, audience, expiry, current user and required document role at the **server**. Reject missing identity (401) and authenticated but insufficient role (403) without leaking content.
3. Map document ID → document-specific Tide role through a reviewed allowlist/service, not a user-supplied arbitrary role field.
4. The protected body must never appear in document list metadata, server-rendered HTML, serialized props, bundled JS, logs or network responses for unauthorized users.
5. Avoid putting privileged admin credentials in frontend or making management API calls with browser-held admin tokens.
6. Keep owner access rules explicit and least-privilege; don't accidentally give all documents to every logged-in user.
7. If role state is present in refreshed Tide-issued access tokens, verify that refresh/relogin is necessary and actually updates entitlements.

**Gate 2:** Automated tests/actual request logs show unauthenticated 401, unapproved 403, and no private-body leakage. A mocked JWT that skips signature verification is insufficient for integration proof.

### Phase 3 — Access-request business workflow (Codex)

1. Add/finish `Request Access` button and a request record (`requesterId`, `documentId`, status, createdAt), with requester identity derived from verified authentication.
2. Display `Requested / Awaiting admin review` without pretending this is a Tide QEA authorization request.
3. Provide a safe operator handoff to the Tide Console for an authorized admin to propose the governed **role grant**. Manual console operation is acceptable for MVP.
4. If there is a documented safe way to reference the genuine QEA request ID/status, integrate a **read-only** display. If not, show generic pending information and rely on the real Tide Console for `0/2`, `1/2`, `2/2`.
5. Do not create an independent local approval engine or approve-access shortcut.

**Gate 3:** App request creation alone leaves content blocked; Tide QEA role grant is the only route to changing access.

### Phase 4 — True 2-of-3 QEA integration test (human Guardians + Codex recording sanitized evidence)

1. Requester attempts to read the protected note → denied (record actual HTTP response).
2. Admin opens Tide Console on non-master realm and initiates role grant for the requester → real QEA change request PENDING (record request identifier/status where safe).
3. Guardian A signs in with an independently enrolled Tide identity and authorizes in Tide enclave → `1/2`, still PENDING. Re-check API: requester still denied.
4. Guardian B (distinct actual admin) authorizes through Tide enclave → threshold `2/2`, change committed/APPROVED. No need for Guardian C.
5. Requester performs documented token refresh or reauthentication. Inspect verified new role claims, then retry the same API → allowed for that note only.
6. Access to another protected note stays forbidden. Test duplicate approval by same Guardian cannot impersonate a distinct approver (where safely testable).
7. Record **actual verified** state transitions without collecting credentials or leaking private tokens.

**Gate 4:** Observed `403 → PENDING → 1/2 still 403 → 2/2 approved → refreshed identity → 200` and cross-document deny. If any step is not reproducible, mark it BLOCKED / PARTIAL, not PASS.

### Phase 5 — Robustness and security checks

- Negative tests: no token, expired/wrong issuer token, wrong audience, unauthorized role, unrelated document, malicious document ID and repeat requests.
- Concurrency/idempotency: duplicate requests cannot silently grant access.
- Identity: approval identities must be distinct, not just different browser tabs for the same user.
- Status fidelity: never interpret an app business request being marked approved as a Tide realm role grant.
- Security: secrets absent from Git, local development setup not exposed publicly; do not delete existing realm/volume.
- Performance: avoid adding unrelated complexity.

### Phase 6 — Handoff

Create `docs/STEP5_QEA_INTEGRATION_REPORT.md` containing:

- Actual Tide realm/client/role identifiers (redact sensitive details), number of admins, quorum verification.
- Changed files and explanation of server-side guard.
- Document request → Tide console role grant mapping; what's automatic vs manual.
- Real test table with columns `case`, `expected`, `actual`, `evidence`, `PASS/FAIL/BLOCKED`.
- Proof of 0/2, 1/2, 2/2 transitions or the exact uncompleted step.
- `npm run build`, tests and runtime verification logs; any issues.
- Setup instructions for a different developer using synthetic data.
- Step 6 handoff: secure demo, README, two-minute video and final QA.

Do not commit screenshots containing personal Tide identities, access tokens or passwords. Do not claim E2EE unless real Tide encryption of the note body and decryption policy are separately implemented and tested.

## 4. Required tests and expected outcomes

| Case | Expected |
|---|---|
| Anonymous document content request | 401 / no protected bytes |
| Signed-in requester lacking document role | 403 / no protected bytes |
| App-only `Request Access` created | Still 403 |
| Tide QEA grant PENDING; 0 approvals | Still 403 |
| Tide QEA grant with 1 of 2 required approvals | Still 403 |
| Tide QEA grant with 2 distinct approvals | Tide role grant committed |
| Token/session refreshed after commit | 200 on intended document only |
| Attempt to read another protected document | 403 |
| Repeat approval by same admin (if supported) | Does not count as a distinct second person |
| Build, tests, Git credential scan | No P0/P1 issues |

## 5. Ready-to-paste Codex execution prompt

```text
You are the SecureDocs full-stack security engineer responsible for Step 5 ONLY.
Read AGENTS.md, C2_REQUIREMENTS.md, C2_STEP2_SECUREDOCS_MVP.md,
C2_STEP4_SECUREDOCS_CODEX_EXECUTION.md, this Step 5 guide, and any real Step
3/Step 4 status reports in the repo. Inspect current code before editing.

Goal: integrate REAL TideCloak QEA-governed document-reader role grants for
one synthetic document. The intended policy is 3 actual tide-realm-admin
identities in a non-master Tide QEA realm, quorum 2. A user must be rejected
until the governed role grant has been committed after approvals by two
distinct humans in Tide's approval enclave and the user's verified session
claims have refreshed.

Use connected Tide Raziel MCP and official Tide documentation to identify
actual SDK APIs, role/claim mechanisms, Tide Console setup and enrollment
requirements. Never invent APIs or claim real approvals without evidence.
First verify Step 3/4 readiness and report blockers. Implement server-side
JWT verification plus per-document role checks on existing content endpoints,
then wire app request UI to an honest pending state and admin handoff.
Do not implement fake approvals, fake quorum counters, a custom signing
protocol, E2EE claims, or frontend-only authorization. Do not perform admin
actions or enroll identities without the user's participation.

Run negative tests for 401/403, one-approval still-denied, two-approval grant,
refreshed token access and cross-document isolation. Record real console and
HTTP evidence with secrets redacted. Create docs/STEP5_QEA_INTEGRATION_REPORT.md,
including all commands executed, tests, observed outcomes, and remaining
manual steps. Preserve repository history and existing auth. Stop before Step 6.
```

## 6. Safety/fallback rules

- If Step 3 or 4 is not finished: do only verified independent code changes, report BLOCKED gates, do not assert an end-to-end success.
- If QEA admin setup is delayed: support manual Tide Console walkthrough, not a fake quorum engine.
- If SDK server-side JWT verifier is missing: derive correct integration from official SDK docs; fail closed meanwhile.
- If the demo needs actual confidentiality from infrastructure admins, discuss **Tide E2EE** as a separate, tested enhancement (Step 6 or later). QEA role controls alone do not encrypt plaintext notes at rest.
- Only synthetic documents and authorized local/realm testing are permitted.

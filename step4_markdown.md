# RMIT Hackathon 2026 â€” C2 SecureDocs
## STEP 4 â€” Application Skeleton, Document Dashboard & Notes MVP

**Execution agent:** Codex in VS Code (Windows/PowerShell)

### Objective
Implement a small, demonstrable SecureDocs application using the existing repository and the TideCloak/Next.js setup from Step 3. Deliver an accessible UI for browsing synthetic documents, writing a note where authentication is available, and viewing the *locked* state of protected documents. Prepare clean interfaces for the Step 5 QEA permission-grant integration. **Do not fabricate Tide/Guardian approvals or unlock protected content.**

### Competition context
- Working prototype: TideCloak integrated, with a compelling trust-control demo.
- Product concept: Owner creates documents; Requester asks for access; 3 Tide QEA administrators/Guardians, with a proposed 2-of-3 quorum, govern the eventual role grant in Step 5.
- Step 4 implements only product skeleton/UI and safe server-side data boundaries.
- Official Tide quickstart: https://docs.tide.org/get-started/Tidecloak%20Quickstart
- Official Tide Next.js guide: https://docs.tide.org/Languages/NextJS/tidecloak-nextjs-intro
- Tide MCP: https://tide.org/agent-plugins

### Non-negotiable implementation rules
1. Inspect repository, Git status, project dependencies, existing TideCloak integration, and `docs/STEP3_ENVIRONMENT_REPORT.md` before editing. If Step 3 is incomplete, list blockers; build only independent UI portions without asserting auth works.
2. Reuse the existing Next.js project/app router or pages router as found. Do not initialize a second project, overwrite configuration, change realms, install unrelated packages, or replace Tide-auth flows.
3. Use synthetic data only. Prefer existing project styling and dependencies; avoid adding a database unless already present and needed. Do not connect external AI/LLM APIs.
4. Treat authorization as **server-side and deny-by-default**. A hidden UI button is never a security control. Until protected TideCloak roles are implemented and verified in Step 5, protected-document content must not be delivered by server routes, page props, hydration payloads, logs, or browser storage.
5. Do not add fake or local-only Guardian approval mechanics, 2/3 counters, simulated quorum success, or `isApproved=true` shortcuts. An approval screen is optional and read-only until real Tide QEA is configured.
6. If calling a Tide SDK/API, use the installed SDK, official Tide Next.js documentation, or connected Raziel playbooks. Never invent Tide APIs, role names, or MCP responses.
7. Do not commit `.env*`, passwords, tokens, secret keys, or recorded authentication sessions. Preserve existing Git files.
8. Make actual code changes, run project commands and tests, and report verified results. Do not stop at planning.

### Phase 0 â€” Inspect / establish gates
- Detect framework, package manager, folder structure, scripts, current route organization, and auth readiness.
- Run non-destructive checks: `git status --short`, `node -v`, `npm -v`, inspect `package.json`; check TideCloak process only where relevant.
- If TideCloak login works, preserve and use it; otherwise implement UI with explicit "TideCloak setup pending" state and deny access to protected content.
- Document exact blockers; no secret logging.

**Gate 0:** Existing app structure understood; Step 3 status reported honestly.

### Phase 1 â€” Define minimal types, mock content, boundaries
Create clear types (adapt to repository naming):

- `Document`: `id`, `title`, `summary`, `ownerId`, `createdAt`, `isProtected`, `status` (status is display metadata, not proof of access).
- `AccessRequest`: `id`, `documentId`, `requesterId`, `status` (`NOT_REQUESTED | PENDING | GRANTED | REJECTED`); Step 4 may expose UI only, without pretending there is a real Tide grant.
- Seed 3â€“4 synthetic document metadata records. Keep any protected body in a server-only module; API must not return it without Tide-verified permission (for Step 4, deny these reads).

Avoid collecting or uploading real personal, clinical or research data.

**Gate 1:** Seed metadata renders; protected body is absent from unauthorized network responses.

### Phase 2 â€” Minimal UI and user journey
Implement responsive screens in the existing framework:

1. **Landing/auth entry:** product proposition, sign-in/out affordance using the existing TideCloak flow when available. Do not imitate a real successful login.
2. **Document dashboard:** cards with title, summary, owner label, lock state, and actions. Use metadata only for documents the viewer is not authorized to read.
3. **Create note:** simple form with title, summary, body and validation. If auth/server persistence is not configured, keep it explicitly in demo/local draft mode and do not represent it as secure storage; never store secrets or protected document bodies in localStorage.
4. **Document detail:** for a locked document, show title, reason for restriction, status, and a `Request access` action. Before Step 5 integration, mark the action as "Coming in Step 5" or disable it rather than falsely creating an approved request. For an explicitly public seed document, viewer may show content.
5. **Account/status:** show current authenticated state if verified; else a setup-pending message.

Simple clean UI is sufficient. No animations or feature expansion. Favor one coherent end-to-end demonstration over multiple disconnected pages.

**Gate 2:** App can be navigated end-to-end; locked content cannot be retrieved; no fake approvals.

### Phase 3 â€” Backend/API boundaries
- Organize data access behind server modules and typed service interfaces.
- Prefer `GET /api/documents` for metadata and a future `GET /api/documents/:id` read interface, using actual framework routing conventions; adapt endpoint names to existing repo.
- For locked bodies, return `401` for unauthenticated or `403` for authenticated-but-unauthorized users; avoid user-existence leaks where possible. Do not treat JWT decoding without signature verification as authorization.
- Introduce a minimal `canReadDocument(user, doc)` interface for Step 5 that currently **denies protected reads** unless connected to already-verified TideCloak policy. No hardcoded `true` in production paths.
- Keep request workflow as an explicit TODO/service boundary for Tide QEA; do not implement a mock approval engine.

**Gate 3:** API tests demonstrate protected content is never returned without authorization.

### Phase 4 â€” Verification
Perform actual, reproducible checks:
- Install dependencies only if required and documented.
- Run `npm run lint` (if provided), `npm run typecheck` (if provided), `npm run build` or the existing build script.
- Run applicable unit/integration tests; add focused tests for unauthorized reads and safe document metadata.
- Start the dev server and inspect actual HTTP responses. Test public metadata, protected body denial, invalid ID, and invalid form fields. If browser automation is not available, give a clear manual browser checklist rather than claiming UI was tested.
- Note any incompatibilities or blockers and preserve the last running app.

### Phase 5 â€” Documentation and handoff
Create `docs/STEP4_IMPLEMENTATION_REPORT.md` with:
- Files changed.
- Completed UI screens and routes.
- Tide auth status (verified / blocked / not tested).
- API/data flow and security assumptions.
- Commands run and results (PASS/FAIL/BLOCKED).
- Demo walkthrough and screenshots only if truly captured.
- Step 5 dependencies: Tide QEA realm setup, 3 designated `tide-realm-admin` accounts, verified 2-of-3 role grant, role/token refresh, server-side authorization; optionally Tide E2EE for actual confidentiality at rest.

Update README with local start instructions without secrets.

### Completion criteria
- Existing project preserved, app launches successfully.
- Document dashboard and locked-document detail render.
- Create-note flow is usable under its stated storage mode.
- No unauthorized user can fetch protected body content via UI or direct endpoint.
- Existing TideCloak authentication is preserved, and its readiness is honestly reported.
- Build/tests run with recorded results.
- No fake Guardian approval, no invented SDK calls, no Step 5 QEA implementation.
- Handoff report completed.

### Final instruction
**Inspect the repository and current Step 3 status, then implement Step 4 immediately.** Ask for interactive Tide enrollment or credentials only if genuinely required. Report any blocker precisely and continue with independent, safe work. Do not move to Step 5.
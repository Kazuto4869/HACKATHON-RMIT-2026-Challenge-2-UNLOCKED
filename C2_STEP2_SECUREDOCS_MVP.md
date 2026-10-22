# RMIT Hackathon 2026 — C2 Step 2: SecureDocs MVP

**Project:** SecureDocs — Guardian-Protected Document Sharing  
**Tagline:** *Your documents. Shared through collective approval.*  
**Status:** Product concept and scope frozen for MVP; implementation and TideCloak integration remain to be tested.  
**Deadline:** 22 October 2026, 18:00 Vietnam time.

## 1. Product concept

SecureDocs is a small web application for creating and sharing sensitive text notes. A requester may see a document's non-sensitive title, but cannot retrieve its protected content until access has been granted through a governed permission change in **TideCloak QEA (Quorum Enforced Authorization)**.

**Trust problem:** In a conventional access-management system, one sufficiently privileged administrator can assign reading permissions unilaterally. In SecureDocs, changes to document-reading roles are subject to QEA approval by a quorum of distinct Tide realm administrators.

**Core demo claim:** One Guardian's approval is insufficient; a valid 2-of-3 quorum commits a role grant; only then can the requester gain access after their session/token is refreshed.

**Important scope:** This is quorum approval for a **permission grant**, not a new approval round for every document open. The app must not claim that document contents are inaccessible to database/server operators until real end-to-end encryption has been implemented and tested.

## 2. Guardian approval model — decision

### Decision: 2-of-3 Guardians, not unanimous approval

Use **3 distinct TideCloak users with `tide-realm-admin`** and the built-in QEA threshold of **2 required approvals**.

Tide documents the default policy as:

`required_approvals = max(1, floor(0.7 * N))`

Here `N` means the number of active `tide-realm-admin` holders in the QEA realm; it does **not** mean the number of users merely labeled "Guardian" in the SecureDocs UI.

| Tide realm admins (N) | Built-in approvals required | Meaning |
| ---: | ---: | --- |
| 1 | 1 | Not suitable for the core claim: one admin can authorize alone. |
| 2 | 1 | Still insufficient for the core claim. |
| **3** | **2** | **Selected MVP: one approval is insufficient.** |
| 4 | 2 | Still two required by the documented formula. |
| 5 | 3 | Three required. |

**Why 2-of-3:** A single person cannot grant access, while the demo still works if one Guardian is unavailable. Requiring **all 3 of 3** is a different policy: it is **not the default QEA setting for three admins**. Do not advertise unanimity or attempt to implement it solely with frontend counters. A custom Tide-supported policy would need separate documentation, integration, and verification.

**Bootstrap prerequisite:** Finish enrolling all three admins and granting each `tide-realm-admin` before showing the core demo. During initial configuration, a realm with only one or two admins does not yet enforce the desired 2-approval threshold. The `master` realm is exempt from QEA; do not use it to demonstrate a no-single-admin property.

References:
- https://docs.tide.org/Core-Concepts/iga-workflow
- https://docs.tide.org/Admin/SetupIGA

## 3. Users and roles

| Actor | Identity and role | MVP capabilities |
| --- | --- | --- |
| Document owner | Ordinary TideCloak-authenticated app user | Create a synthetic text note; view own notes. Not automatically a QEA admin. |
| Requester | Ordinary authenticated app user | List permitted metadata; request access; read content only after role grant. |
| Guardian A/B/C | **Three distinct `tide-realm-admin` identities in TideCloak** | Review and authorize governed changes from the **Tide QEA Approvals** console. |
| Authorized operator | Admin with required Tide permissions | Submit the governed document-role grant request; cannot bypass quorum. |

**Document-scoped authorization:** Prefer a role like `doc_research_notes_reader` for the main demo document. Backend policy maps the approved role to one document ID. Never use a global `approved_researcher` role that unintentionally unlocks every note.

## 4. Exact MVP behavior

1. The owner creates a text document with a public-safe title and private body (synthetic content only).
2. The requester signs in through TideCloak and can see the title, but `GET /api/documents/:id/content` denies content access without the document-specific role.
3. The requester selects **Request access**. SecureDocs records a request visible to the operator. **This is an application request, not yet a Tide QEA change request.**
4. The authorized operator initiates a **TideCloak role grant** for that requester. Tide QEA captures the governed change as `PENDING`.
5. Guardian A approves in Tide QEA Approvals: count reaches `1/2`; the role is **not yet assigned**; the requester is still denied.
6. Guardian B, a distinct Tide admin, approves: count reaches `2/2`; Tide commits the role grant and the governed request becomes `APPROVED`.
7. The requester signs in again or refreshes identity claims as needed. The backend validates the Tide-issued identity/token and required document role, then returns the protected content.
8. Optional follow-up: a later role revocation passes through QEA; verify that access is denied after permissions/session are refreshed.

**Never unlock content based only on a UI counter or the status of the app's own access-request database row.** The server must verify authoritative role state via a verified Tide-issued token or an appropriate server-side Tide authorization mechanism.

**UI honesty:** If the app cannot read QEA request status directly, link to Tide Console and show the in-app request as *Awaiting admin review* rather than inventing the approval count. The judge can see the real `0/2 → 1/2 → 2/2` in Tide Console.

## 5. Minimal screens

| Screen | Necessary elements | Acceptance criteria |
| --- | --- | --- |
| Login | TideCloak authentication | Authentication actually works. |
| Documents | 2–3 synthetic titles, locked/unlocked state | Unprivileged requester cannot see protected bodies. |
| Document detail | Description, Request access, protected reader | Before approved role: 403; afterward: 200. |
| Access requests | Requested user, document, admin handoff/status | Creation never directly grants a role. |
| Tide Console (external) | QEA Approvals | Shows real quorum-controlled role-grant change. |

Avoid custom Guardian login screens, PDF upload, AI chatbot, real patient/research data, or a bespoke cryptographic approval service in the MVP.

## 6. Architecture and security boundary

```text
Browser (Tide-authenticated user)
    | OIDC session / token
    v
Next.js application + server API
    | Verify token, derive user identity and document-specific role
    | Deny unless role is valid
    v
Synthetic notes store (demo only)

Access request in SecureDocs (business workflow)
    -> authorized admin proposes document-role grant in TideCloak
    -> Tide QEA PENDING -> Guardian A approves -> Guardian B approves
    -> Tide commits role change -> identity claims refreshed
    -> app server permits access
```

- Keep admin tokens and Tide management credentials out of browsers and GitHub.
- Validate authorization on **server APIs**, not only by hiding buttons.
- Do not return private note bodies in document-list payloads, logs, previews, or bundled frontend files.
- Use synthetic content; store secrets in environment variables excluded from Git.
- QEA protects governed IAM actions. Unless Tide E2EE is implemented, content protection depends on the app/database/server architecture too.
- Real Tide encryption (`doEncrypt` / `doDecrypt`) can be an enhancement after the 2-of-3 end-to-end demo succeeds, provided the team can verify its role configuration and ciphertext behavior.

## 7. Definition of Done — MVP release gates

- [ ] The app and TideCloak Quickstart run locally.
- [ ] Tide realm QEA and licensing/enrollment are configured.
- [ ] **Exactly three intended QEA admins** are enrolled; roles and current threshold are verified as `2`.
- [ ] A synthetic document exists and can be retrieved by its owner.
- [ ] An unapproved requester receives an actual **403** when asking the server for the note body.
- [ ] A Tide role grant creates a QEA `PENDING` change request.
- [ ] After one distinct approval, the role is still not applied and note access is still blocked.
- [ ] After a second distinct approval, Tide QEA commits the change.
- [ ] After refreshing identity claims, the requester can read the intended document, not unrelated documents.
- [ ] README answers the five Tide judging questions in at most 300 words in its project-overview section.
- [ ] A real, two-minute MP4 demo (<100 MB) is in the **public** GitHub repository.
- [ ] Repository URL is submitted through the official Google Form before the deadline.

## 8. Demo storyboard (120 seconds maximum)

| Time | What judges see | Message |
| --- | --- | --- |
| 0–15s | SecureDocs and locked research note | A single admin should not control sensitive sharing. |
| 15–35s | Requester fails to open content (server-side 403) | Access is genuinely blocked. |
| 35–60s | Admin proposes TideCloak role grant | QEA captures a pending permission change. |
| 60–80s | Guardian A authorizes, pending remains | One Guardian cannot grant access. |
| 80–100s | Guardian B authorizes, QEA commits | Quorum creates authorization. |
| 100–115s | Requester refreshes session and opens note | New access is verified server-side. |
| 115–120s | Project title and repository link | TideCloak is essential to the workflow. |

Record real application and Tide Console screens, not a mock approval animation.

## 9. Step 3 handoff — what Codex must implement next

1. Inspect TideCloak Next.js Quickstart and Raziel MCP; prefer the official starter instead of coding OIDC from scratch.
2. Verify the QEA realm and three distinct `tide-realm-admin`s, as well as `2` actual required authorizations.
3. Build the note list and a server-protected note-content endpoint.
4. Implement request-access tracking as **business workflow only**, then connect the operator action to an actual Tide governed role grant (console workflow is acceptable for MVP).
5. Prove in logs and the Tide Console that the role grant stays uncommitted at `1/2` and commits at `2/2`.
6. Revalidate token claims after granting access; run negative tests and produce a demo recording.

**Implementation references:**
- https://docs.tide.org/get-started/Tidecloak%20Quickstart
- https://docs.tide.org/Core-Concepts/iga-workflow
- https://docs.tide.org/Admin/SetupIGA
- https://docs.tide.org/Admin/e2ee
- https://tide.org/unlocked/#submit

## 10. Explicit non-goals and unresolved details

**Non-goals:** unanimity (3/3), per-open approval, production-grade file storage, real medical documents, generic admin superpowers, invented Tide endpoints or custom approval cryptography.

**Validate in Step 3:** TideCloak SDK/Next.js version compatibility; exact QEA console flow and roles; availability of browser enrollment for three admins; role claim visibility in the app; license/network prerequisites; whether the host's demo environment allows all identity refresh steps.

The exact UI and API implementation may change based on the official starter. Do **not** weaken the 2-of-3 Tide approval requirement to make a demo appear complete.

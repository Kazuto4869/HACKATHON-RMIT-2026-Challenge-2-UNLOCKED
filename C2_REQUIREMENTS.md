# RMIT Hackathon 2026 — Challenge 2 / UNLOCKED

**Status:** Step 1 — Requirements baseline  
**Date:** 22 October 2026 (Vietnam, UTC+7)  
**Submission deadline:** 18:00, 22 October 2026 (Vietnam)  
**Primary source:** https://tide.org/unlocked/#challenge  
**Technical references:** https://tide.org/agent-plugins · https://docs.tide.org/get-started/Tidecloak%20Quickstart

## 1. Mission

Build a **small working prototype** integrating **TideCloak**. Show one meaningful possibility enabled by eliminating unilateral control over sensitive data or decisions. Clearly demonstrate:

1. **Possibility:** what user-facing experience or service becomes possible?
2. **Trust constraint:** who previously held unilateral power, and why was that a problem?
3. **Policy/authority:** whose identity, rights, or approvals must align for a protected action?
4. **TideCloak's material contribution:** which TideCloak capability actually enforces the property?
5. **Evidence:** one working allow case and one denied / blocked / unauthorised case, with actual integration.

A conventional login-only demo is unlikely to satisfy the *Why TideCloak matters* criterion. Do not claim that distributed authority is implemented unless the actual configuration and observed behaviour substantiate it.

## 2. Judging rubric (official)

| Criterion | Weight | What to demonstrate |
|---|---:|---|
| Vision & originality | 25% | A fresh possibility and clear differentiator |
| Trust constraint insight | 20% | Specific unilateral-power / privacy / custody bottleneck |
| Value & impact | 20% | A concrete beneficiary and real-world example |
| Why TideCloak matters | 20% | A demonstrably necessary TideCloak integration |
| Prototype & storytelling | 15% | Working flow and understandable demo |

**Interpretation:** 65% rewards the idea, trust problem and impact; 20% rewards TideCloak's role; 15% rewards functional demonstration and storytelling. These weights guide prioritisation; functionality and genuine integration are submission requirements regardless of scoring weight.

## 3. Required deliverables (official)

### Public GitHub repository

- Working prototype source code.
- Actual TideCloak integration.
- README with a **project overview of 300 words or fewer**, placed at the top.
- A one-sentence product description.
- Answers to **all five README prompts**, corresponding to the rubric:
  - Vision & originality.
  - Trust constraint insight.
  - Value & impact.
  - Why TideCloak matters.
  - Prototype & storytelling.
- Setup instructions placed in a **separate section** (not part of the 300-word overview).
- A **two-minute `.mp4` demonstration video**, **under 100 MB**, committed or otherwise present in the public repository as stipulated.

### Formal submission

- Submit the **public repository link** through https://forms.gle/HRHYjnqB86j1LFS97.
- Deadline: **18:00, 22 October 2026, Vietnam time**.
- Confirm the submitted URL opens without authentication and shows required files.

## 4. Allowed / suggested implementation choices

- Synthetic and mocked data/systems are explicitly encouraged.
- AI coding agents are allowed.
- Official main route: attach Tide's **Raziel MCP** to a compatible coding agent such as Codex or Google Antigravity.
- Official fallback: start from **TideCloak Quickstart** instead of relying on MCP. Hence MCP is a recommended development channel, not established as a hard submission prerequisite.
- No production-grade product, proprietary data or complicated deployment is requested.
- TideCloak's Quickstart offers a Next.js scaffold with a TideCloak dev instance. It calls for Docker, Node.js >=20.9, internet access and a Tide enrollment step. Confirm setup from the live guide rather than copying example development secrets into a public repository.

## 5. Architectural invariant for Step 2

Every proposed product must identify **one security-relevant operation** and answer:

| Question | Required answer before implementation |
|---|---|
| Actor | Who attempts the action? |
| Asset | What sensitive item or decision is protected? |
| Policy | Which identities/roles/approvals authorise the action? |
| Enforcement | What does TideCloak enforce (as verified in current SDK / playbook)? |
| Allowed demo | What succeeds after the correct conditions are met? |
| Denied demo | What fails when an essential permission or approval is absent? |
| Single-point-control | Why should an app owner/admin/server not bypass the safeguard alone? |

**Important distinction:** Frontend button disabling, a fake approval banner or local role checks alone do not prove TideCloak distributed-authority enforcement. A demo must show a TideCloak-backed operation; do not infer wider cryptographic guarantees from an ordinary login session.

## 6. Minimum acceptance criteria

### Product
- [ ] One-sentence product proposition and named beneficiary.
- [ ] Precise trust constraint and harmful unilateral action.
- [ ] TideCloak-backed protected path demonstrably works.
- [ ] Negative path blocks an unauthorised user/action and is tested on the relevant enforcement boundary.
- [ ] At least one credible end-to-end use case using synthetic data.

### Engineering
- [ ] Application starts by following the README from a clean environment.
- [ ] All required dependencies and TideCloak setup are documented.
- [ ] No real secrets, production credentials, private keys or personal data are committed.
- [ ] Demo does not claim a policy is enforced by Tide without verifying the SDK/server-side evidence.
- [ ] UI distinguishes actual TideCloak-backed flows from mocked domain systems.

### Submission
- [ ] Public GitHub repository contains working code and README.
- [ ] The ≤300-word overview appears at top of README, addressing the five prompts.
- [ ] Two-minute MP4, <100 MB, included in the repository.
- [ ] Repository URL submitted and submission confirmed before deadline.

## 7. Suggested two-minute demo outline

| Time | Narrative | Show |
|---|---|---|
| 0:00–0:20 | The possibility | Who benefits / one-sentence pitch |
| 0:20–0:40 | The trust bottleneck | What unilateral control prevents |
| 0:40–1:25 | Working prototype | User interaction + TideCloak-backed protection |
| 1:25–1:45 | Negative / denied flow | Unauthorised request or action blocked |
| 1:45–2:00 | What changes | Why capability matters and for whom |

This is a recommended story structure, not an additional official rule.

## 8. Open design decisions — resolve in Step 2

1. Choose one original but *demonstrable* possibility, not several features.
2. Choose **one** TideCloak capability central to that possibility (e.g. authority-based approval, tamper-resistant authorisation, privacy-preserving access). Verify available SDK/playbook support.
3. Fix the minimum user journey and allow/deny acceptance tests.
4. Decide whether Raziel MCP works in the team's agent; if not, immediately fall back to the official Quickstart.
5. Select stack only after checking the integration template and demo needs. Next.js is a safe initial direction, not a competition requirement.
6. Decide how to capture the video and keep it under GitHub's 100 MB file limit.

## 9. Step 1 completion gate

**Step 1 passes when the team agrees on the official requirements above and can state the trust constraint test for a proposed idea.**

No UI implementation, database selection, specific TideCloak policy or promise of cryptographic guarantees should be fixed before Step 2 checks feasibility with Raziel / Tide docs.

### Reference URLs

- Official UNLOCKED challenge: https://tide.org/unlocked/#challenge
- Raziel MCP: https://tide.org/agent-plugins
- TideCloak overview: https://tide.org/tidecloak
- TideCloak quickstart: https://docs.tide.org/get-started/Tidecloak%20Quickstart
- Submit: https://forms.gle/HRHYjnqB86j1LFS97

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router with TypeScript, selected by the approved STEP 4 execution plan.

## Users

Document owners create synthetic notes; requesters browse safe metadata and encounter an honest locked state; Tide realm administrators will govern later permission grants outside this STEP 4 app.

## Product Purpose

SecureDocs demonstrates document sharing in which sensitive content stays unavailable until a future TideCloak-backed authorization decision is verified on the server.

## Positioning

The product separates an application access request from the authoritative, quorum-governed TideCloak permission grant instead of simulating approval inside the app.

## Operating Context

A hackathon evaluator follows a short desktop or mobile journey through a document register, a locked detail screen, a demo note form, and an authentication-readiness status page.

## Capabilities and Constraints

STEP 4 uses synthetic data only. Protected bodies never enter metadata payloads, browser storage, or unauthorized responses. The existing `securedocs` TideCloak realm is preserved, but in-app authentication and QEA integration remain for STEP 5.

## Evidence on Hand

`docs/STEP3_ENVIRONMENT_REPORT.md` records a working local TideCloak realm and one linked administrator. No verified application-user login, three-Guardian quorum, role grant, or encrypted document flow exists yet and none may be implied.

## Product Principles

- Deny protected reads by default.
- Label demo-only behavior plainly.
- Keep metadata useful without leaking content.
- Treat TideCloak as the future authority, never as decorative UI.

## Accessibility & Inclusion

Responsive keyboard-accessible web UI with semantic controls, visible focus, sufficient contrast, and reduced-motion-safe behavior.

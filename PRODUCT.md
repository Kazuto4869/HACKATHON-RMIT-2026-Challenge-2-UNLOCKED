# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router with TypeScript and the official `@tidecloak/nextjs` adapter.

## Users

Document owners create synthetic notes; requesters browse safe metadata, sign in through TideCloak, and request access; Tide realm administrators govern the actual document-role grant in the Tide console.

## Product Purpose

SecureDocs demonstrates document sharing in which sensitive content stays unavailable until a TideCloak access token is verified on the server and carries the exact role for that document.

## Positioning

The product separates an application access request from the authoritative, quorum-governed TideCloak permission grant instead of simulating approval inside the app.

## Operating Context

A hackathon evaluator follows a short desktop or mobile journey through a document register, a locked detail screen, a demo note form, and an authentication-readiness status page.

## Capabilities and Constraints

STEP 5 uses synthetic data only. Protected bodies never enter metadata payloads, browser storage, or unauthorized responses. An application request stays `PENDING`; it never assigns a role or impersonates Guardian approval. The existing `securedocs` realm is preserved, while live three-Guardian and 2-of-3 verification requires the local Docker engine.

## Evidence on Hand

`docs/STEP3_ENVIRONMENT_REPORT.md` records a previously working local TideCloak realm and one linked administrator. The STEP 5 code boundary and negative API cases are verified. No live application-user login, three-Guardian quorum, successful governed role grant, or encrypted document flow is claimed until it is reproduced against the restored realm.

## Product Principles

- Deny protected reads by default.
- Label demo-only behavior plainly.
- Keep metadata useful without leaking content.
- Treat TideCloak as the authorization authority, never as decorative UI.

## Accessibility & Inclusion

Responsive keyboard-accessible web UI with semantic controls, visible focus, sufficient contrast, and reduced-motion-safe behavior.

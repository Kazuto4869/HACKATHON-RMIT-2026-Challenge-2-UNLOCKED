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

A hackathon evaluator follows a short desktop or mobile browser journey through documents, sign-in, note creation, an access request and a protected reader. Administrators review actual permission changes in Tide Console.

## Capabilities and Constraints

STEP 6 uses synthetic data only. Notes and idempotent per-user requests persist in server-side SQLite. Protected bodies never enter metadata payloads, browser storage, or unauthorized responses. Authenticated owners read their own notes; others require a verified document-specific Tide client role. An application request never assigns a role or impersonates Guardian approval. Guardian approvals happen in Tide Console; the website has no custom approval engine. SQLite is plaintext, not E2EE. No upload, production deployment, or Step 7 hardening is included.

## Evidence on Hand

The current host has the existing running TideCloak container, realm and one linked administrator. Step 5/6 code boundaries, persistence and negative API checks are documented in `docs/STEP6_CORE_FEATURES_REPORT.md`. A live application login and 0/2 → 1/2 → 2/2 grant remain manual acceptance gates. Local test signing keys verify application cryptography only; they are not evidence of Tide enrollment or quorum.

## Product Principles

- Deny protected reads by default.
- Label demo-only behavior plainly.
- Keep metadata useful without leaking content.
- Treat TideCloak as the authorization authority, never as decorative UI.

## Accessibility & Inclusion

Responsive keyboard-accessible web UI with semantic controls, visible focus, sufficient contrast, and reduced-motion-safe behavior.

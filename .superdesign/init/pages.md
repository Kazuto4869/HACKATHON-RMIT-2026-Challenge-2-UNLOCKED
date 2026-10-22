# Page dependency trees

## `/` — document dashboard
- `app/page.tsx`
  - `components/icons.tsx`
  - `components/status-chip.tsx`
  - `src/server/documents.server.ts`
    - `src/server/document-service.ts`
    - `src/server/document-store.server.ts`
    - `src/server/tide-authorization.ts`
    - `src/domain/documents.ts`

## `/documents/[id]` — reader / locked state
- `app/documents/[id]/page.tsx`
  - `components/icons.tsx`
  - `components/status-chip.tsx`
  - `src/server/documents.server.ts`
    - `src/server/document-service.ts`
    - `src/server/document-store.server.ts`
    - `src/server/tide-authorization.ts`
    - `src/domain/documents.ts`

## `/notes/new` — local demo note
- `app/notes/new/page.tsx`
  - `components/icons.tsx`
  - `components/note-form.tsx`
    - `src/domain/note-validation.ts`
    - `components/icons.tsx`

## `/account` — readiness ledger
- `app/account/page.tsx`
  - `components/icons.tsx`
  - `components/status-chip.tsx`

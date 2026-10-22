# Application routes

Next.js App Router; there is no explicit router configuration file.

| URL | Entry | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Synthetic document register and status overview |
| `/documents/[id]` | `app/documents/[id]/page.tsx` | Public reader or deny-by-default locked state |
| `/notes/new` | `app/notes/new/page.tsx` | In-memory synthetic-note form |
| `/account` | `app/account/page.tsx` | Verified realm/admin readiness and missing app integration |
| `/api/documents` | `app/api/documents/route.ts` | Metadata-only listing |
| `/api/documents/[id]` | `app/api/documents/[id]/route.ts` | Server authorization boundary for document reads |

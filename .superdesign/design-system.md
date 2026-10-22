# SecureDocs UI design system

## Product

SecureDocs is a simple document-sharing prototype. Keep the interface calm, familiar, and low-text. Use short everyday labels. Never expose document bodies in list views or imply that TideCloak authentication, access requests, or Guardian quorum are active when they are not.

## Visual direction

- Bright, airy workspace inspired by familiar document tools.
- Desktop shell has a 220px pale sidebar and a white content surface. On small screens, collapse the sidebar into a compact top navigation.
- Generous whitespace, rounded-xl cards, subtle borders, minimal decoration.
- Use Lucide React outline icons consistently; no security-themed dark surfaces or invented brand marks.

## Colors

| Token | Value | Usage |
| --- | --- | --- |
| `canvas` | `#F8FAFC` | App background and sidebar |
| `surface` | `#FFFFFF` | Cards and main content |
| `border` | `#E2E8F0` | Subtle dividers and card borders |
| `text` | `#0F172A` | Primary text |
| `muted` | `#64748B` | Secondary text |
| `primary` | `#2563EB` | Main actions; hover `#1D4ED8` |
| `success` | `#16A34A` on `#DCFCE7` | Available / approved |
| `pending` | `#D97706` on `#FEF3C7` | Pending only when backed by actual request data |
| `restricted` | `#DC2626` on `#FEE2E2` | Locked / restricted |

## UI rules

- Navigation contains My Documents, Shared Requests, and Guardians. Include a quiet â€œProtected by TideCloakâ€ footer label.
- Document cards contain only title, one-line summary, and an access badge. Search and â€œ+ New Noteâ€ sit in the dashboard header.
- Use `Available` for the existing public-safe record and `Locked` for protected records. Do not manufacture pending approvals.
- Requests and Guardian views must communicate the verified current state: no request workflow exists; one linked Tide administrator is verified, while three-Guardian 2-of-3 quorum is not configured. Do not invent people or approval status.
- Preserve current server-side deny-by-default behavior and protected document routes. UI is not an authorization boundary.
- Keep keyboard focus visible, labels accessible, and contrast readable.


# SecureDocs interface direction

<!-- impeccable:design-schema 1 -->

## Mode

Operate. The evaluator should understand the access boundary while completing a short, coherent document workflow.

## Visual system

Use the approved light, airy web design: Slate 50 background/sidebar, white surfaces, Slate 200 borders, Slate 900 text, Slate 500 secondary text, and Blue 600 primary actions. A 220px desktop sidebar contains My Documents, Shared Requests and Guardians. Use rounded-xl cards, p-6 and gap-6. Document cards show only title, a one-line summary and a status badge. No dark sidebar, jargon-heavy dashboard or decorative security logs.

## First viewport

Lead with My Documents, search, New Note and a three-column document grid. Available, Pending and Locked states must reflect actual access/request information. Never display an invented 1/2 approval count.

## Interaction

Use direct links and native form controls. No ornamental animation. Hover, focus, disabled, error, and success states must communicate the result in words. Authentication failure, anonymous access, role denial, pending application request, and authorized content are distinct states; a pending request must never look approved.

## Responsive behavior

Desktop uses three columns, tablet two and mobile one. Sidebar navigation wraps horizontally on smaller screens. Touch controls remain at least 44px high.

## Reusable tokens

Tailwind classes and small shared component rules in `app/globals.css` define the system. Lucide supplies icons. Green means Available, amber Pending and red Locked; every badge also has a text label. Requests show business status, while actual role-grant approval belongs to TideCloak.

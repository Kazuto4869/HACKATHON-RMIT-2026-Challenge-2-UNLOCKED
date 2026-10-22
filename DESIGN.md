# SecureDocs interface direction

<!-- impeccable:design-schema 1 -->

## Mode

Operate. The evaluator should understand the access boundary while completing a short, coherent document workflow.

## Visual system

Use a quiet document-registry character: warm paper surfaces, deep ink text, a restrained moss accent, squared editorial type hierarchy, and thin rules. Prefer structured rows and generous whitespace over a grid of interchangeable cards. Locks and status labels must remain legible without color.

## First viewport

Lead with the working document register and its mixed public/locked states, not a marketing hero. Make the server-enforced boundary visible in the dashboard copy and primary locked action.

## Interaction

Use direct links and native form controls. No ornamental animation. Hover, focus, disabled, error, and success states must communicate the result in words. Authentication failure, anonymous access, role denial, pending application request, and authorized content are distinct states; a pending request must never look approved.

## Responsive behavior

Desktop rows collapse into stacked document summaries below tablet width; navigation wraps without hiding routes; touch targets remain at least 44px high.

## Reusable tokens

Tokens live in `app/globals.css` for paper, ink, muted ink, rule, moss, amber, danger, radii, and elevation. Components use those tokens rather than route-specific colors.

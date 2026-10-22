---
name: build-demo
description: Build a minimal web demo or API-backed product for a hackathon rubric, with runnable UI and verified user flow.
---

# MVP demo

1. Check organizer explicitly requires a web app, demo or API endpoint. If not, don't create one.
2. Translate scoring rubric into a one-page acceptance checklist and user journey.
3. Write API contracts with model owner before integrating; use mocks if API unavailable and label mock data.
4. Implement one functional happy path, then loading, empty, error and permission states; avoid external CDNs if offline.
5. Start app, inspect it with available browser/terminal tools and record real testing results.
6. Provide run/setup commands, environment config without secrets, screenshots or demo only when required.
7. Keep source edits restricted to owned paths and report dependencies/risks to integrator.

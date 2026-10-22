# SecureDocs

> Synthetic document sharing with protected reads reserved for verified, collectively governed access.

## Project overview

**Vision & originality.** SecureDocs lets people discover useful document metadata while sensitive note bodies remain unavailable until a TideCloak access token is verified by the server and carries the exact role for that document.

**Trust constraint.** A conventional privileged administrator could grant access alone. The target STEP 5 demonstration uses TideCloak QEA so a document-role change is not committed by one administrator acting unilaterally.

**Value & impact.** Research, community, and review teams can share enough context for someone to request access without prematurely exposing the underlying material.

**Why TideCloak matters.** STEP 5 uses the official TideCloak Next.js adapter for browser authentication and server-side JWT verification. Client roles map one-to-one to protected documents. The app records access requests, but only a real Tide console role proposal and Guardian quorum can grant access.

**Prototype & storytelling.** The responsive app includes a synthetic document register, a locked-document screen, a public reader, an in-memory demo-note form, a truthful authentication-status page, and APIs that keep restricted bodies server-side.

## STEP 1–6 website

Current evidence and the remaining live gates are in [the Step 1–6 review handoff](docs/STEP1_6_REVIEW_HANDOFF.md) and [the Step 6 report](docs/STEP6_CORE_FEATURES_REPORT.md). The code checks pass; the real three-Guardian acceptance is not yet complete. Render is deferred while finishing the local demo.

Requirements: Node.js 24.11 or later and npm. The website uses built-in Node SQLite; Node 24.11 currently emits an experimental SQLite warning.

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Copy `.env.example` to `.env.local` and set the verified realm/client values. The current local values are `http://127.0.0.1:8080/`, `securedocs`, `securedocs-client`, and website origin `http://127.0.0.1:3000`. Keep these exact origins consistent.

Export the **Tide** client adapter to the gitignored `tidecloak.json` from `GET /admin/realms/{realm}/vendorResources/get-installations-provider?clientId={client UUID}&providerId=keycloak-oidc-keycloak-json`. The ordinary Keycloak installation endpoint omits Tide fields. The runtime requires embedded public `jwk` keys; it never substitutes remote signing keys when the adapter is missing. Browser config contains only allowlisted public adapter fields, never client secrets. Commit and sign the new redirect origin in TideCloak, re-export the adapter, and restart the website. See [Vietnamese setup/enrollment instructions](docs/TIDE_GUARDIAN_SETUP_VI.md).

Open <http://127.0.0.1:3000/>. With the server running, use `npm run verify:step6` for HTTP smoke checks. It checks anonymous/forged-token denials, public reads, routes and absent protected content; it does not claim a live Tide login or QEA grant.

The optional `Dockerfile` builds a standalone website image: `docker build -t securedocs-web:local .`. A read-only unauthenticated preview can run with `docker run --rm -p 127.0.0.1:3001:3000 securedocs-web:local`. The adapter, `.env.local` and database are deliberately excluded. Full Tide authentication inside Docker needs explicit runtime adapter mounting and container-to-host issuer/JWKS networking; use the host Node server for the local integrated demo. TideCloak remains in its separate existing container.

Notes and pending requests persist in `.data/securedocs.sqlite` across restarts. This directory and SQLite journal files are ignored by Git and excluded from standalone/image builds. Do not delete `.data` to troubleshoot. New notes use the verified token subject as owner; a user cannot supply another owner. Verified owners can read their own notes; other readers require the exact document-specific client role. Public notes are readable by everyone. Metadata responses never contain bodies.

Only synthetic data is permitted. SQLite stores bodies in plaintext on the server; no E2EE guarantee is claimed. Missing, malformed, forged, expired, wrong-issuer, wrong-audience and wrong-client tokens fail closed. Requests are persistent and idempotent per user/document, but never grant a role. Their displayed Available state is derived from the current verified permission, not an app-local approval flag.

On this Windows checkout, Docker Engine and `securedocs-tidecloak` were re-verified running, with the existing `securedocs_tide_data` volume preserved. Realm `securedocs` and one linked Tide administrator exist. The imported Step 5 report's missing-container claim describes another host and is historical here. Website sign-in and owner create/read are user-confirmed; additional Guardian enrollments and the real 2-of-3 grant remain subject to the gates in [the Step 6 report](docs/STEP6_CORE_FEATURES_REPORT.md). Seven QEA changes were observed pending with zero approvals after an enclave timeout; no approval was automated or fabricated.

## SecureDocs local development (STEP 3)

Windows PowerShell and VS Code terminal; development only. See the
[environment verification report](docs/STEP3_ENVIRONMENT_REPORT.md) for tested
results and the historical authentication-ready state. The existing Docker
container and volume have been re-verified on this host and are preserved.

Realm verified during STEP 3: `securedocs`. Its linked Tide administrator used
<http://127.0.0.1:8080/realms/securedocs/tide-console/>. Enrollment and a console
login session were verified then; the current runtime and three-Guardian quorum
are not yet re-verified.

1. Start Docker Desktop with its Linux/WSL 2 engine. Verify `docker version`,
   `docker info`, and `docker ps` succeed; a CLI version alone is insufficient.
2. Inspect `docker ps -a` and `docker logs --tail 80 securedocs-tidecloak` if
   the container exists. Preserve its data. Confirm its port binding is loopback
   and its H2 mount uses the named volume before `docker start securedocs-tidecloak`.
   For a new container, first ensure port 8080 is free:

   ```powershell
   Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
   ```

   Only when the container does not exist and the port is free, run:

   ```powershell
   docker volume create securedocs_tide_data
   if ($LASTEXITCODE -ne 0) { throw 'Volume creation failed' }
   # This image runs as UID 1000; a new Docker volume is owned by root.
   docker run --rm --user 0 --entrypoint /bin/sh `
     --mount type=volume,source=securedocs_tide_data,target=/inspect `
     tideorg/tidecloak-dev:latest -c 'chown 1000:0 /inspect'
   if ($LASTEXITCODE -ne 0) { throw 'Volume ownership setup failed' }
   $devPassword = Read-Host 'New strong TideCloak dev admin password' -AsSecureString
   try {
     $env:KC_BOOTSTRAP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $devPassword).Password
     docker run -d --name securedocs-tidecloak `
       -p 127.0.0.1:8080:8080 `
       -v securedocs_tide_data:/opt/keycloak/data/h2 `
       -e KC_BOOTSTRAP_ADMIN_USERNAME=admin `
       -e KC_BOOTSTRAP_ADMIN_PASSWORD tideorg/tidecloak-dev:latest
     if ($LASTEXITCODE -ne 0) { throw 'TideCloak container creation failed' }
   } finally {
     Remove-Item Env:KC_BOOTSTRAP_ADMIN_PASSWORD -ErrorAction SilentlyContinue
     $devPassword.Dispose()
   }
   docker ps --filter name=securedocs-tidecloak
   docker logs --tail 80 securedocs-tidecloak
   Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/
   ```

   Open <http://127.0.0.1:8080/>. Sign in as `admin` using your local password.
   The H2 database persists in `securedocs_tide_data`; do not delete/reset it.
   Container environment variables remain readable by local Docker administrators.
   Changing bootstrap variables does not rotate an existing account's password;
   rotate it through account administration. This run used a temporary weak password
   at the user's explicit request; replace it before real data or shared use.
3. Run `agy --version`, then `agy` from this existing repository. Complete Google
   login yourself if prompted. No Antigravity IDE is required.
4. `.agents/mcp_config.json` defines the remote `tide-raziel` server using
   `serverUrl`. Merge any future entries into `mcpServers`. If this CLI version
   does not discover workspace configuration, use its supported registration:

   ```powershell
   agy mcp add tide-raziel https://mcp.tide.org/mcp
   agy mcp list
   ```

   This also registers the server in the user's global MCP configuration.
   In AGY, open `/mcp` and check connected status, then request:
   `Call tide-raziel tide_playbook with name initialize-admin-and-link-account.
   Read-only; do not modify files or create a realm.` Approve that read-only tool
   when prompted. Server discovery alone does not prove a tool request succeeded.
5. Follow the [official admin setup wizard](https://docs.tide.org/Admin/Quick-deploy-test).
   Supply your own license email, personally accept [Tide terms](https://tide.org/legal),
   and complete Tide account enrollment in the browser. Check licensing and a real
   login before calling authentication ready. Do not run the Next.js initializer
   over this repository for STEP 3.

Raziel serves documentation; the Docker container serves TideCloak. QEA governs
role/permission changes, rather than every document open. Three enrolled
`tide-realm-admin` holders give the documented 2-approval threshold, which still
requires a later live allow/deny test. Guardian implementation is outside STEP 3.

References: [TideCloak quickstart](https://docs.tide.org/get-started/Tidecloak%20Quickstart),
[AGY CLI MCP](https://antigravity.google/docs/mcp?tab=cli),
[Raziel](https://github.com/tide-foundation/raziel-mcp),
[QEA governance](https://docs.tide.org/Core-Concepts/iga-workflow).

Local demo update: website sign-in is user-confirmed. The write-origin check now uses the configured public origin because NextRequest normalizes `127.0.0.1` to `localhost`; unrelated origins remain blocked. Browser save/read are user-confirmed; the real three-Guardian grant still needs acceptance (see the Step 6 report).

Confirmed browser follow-up: user successfully signed in, saved a note and read it after the write-origin fix. Remaining live acceptance: logout/refresh, two independent Guardian enrollments, and genuine 2-of-3 role-grant enforcement.

# SecureDocs

> Synthetic document sharing with protected reads reserved for verified, collectively governed access.

## Project overview

**Vision & originality.** SecureDocs lets people discover useful document metadata while sensitive note bodies remain unavailable until a TideCloak access token is verified by the server and carries the exact role for that document.

**Trust constraint.** A conventional privileged administrator could grant access alone. The target STEP 5 demonstration uses TideCloak QEA so a document-role change is not committed by one administrator acting unilaterally.

**Value & impact.** Research, community, and review teams can share enough context for someone to request access without prematurely exposing the underlying material.

**Why TideCloak matters.** STEP 5 uses the official TideCloak Next.js adapter for browser authentication and server-side JWT verification. Client roles map one-to-one to protected documents. The app records access requests, but only a real Tide console role proposal and Guardian quorum can grant access.

**Prototype & storytelling.** The responsive app includes a synthetic document register, a locked-document screen, a public reader, an in-memory demo-note form, a truthful authentication-status page, and APIs that keep restricted bodies server-side.

## STEP 5 application

Requirements: Node.js 20.9 or later and npm. The verified implementation used Node.js 24.21.0 and npm 11.19.0.

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Copy `.env.example` to `.env.local` and confirm the public realm/client values against the downloaded `securedocs-client` adapter once a realm is configured. Open <http://127.0.0.1:3000/>; the configured redirect URI and silent-check URI deliberately use that exact origin.

The create-note screen and access-request store are deliberately in-memory synthetic demos. Refreshing removes a note draft, and restarting the server removes pending requests. Do not enter real or confidential information. The app does not commit `tidecloak.json`, tokens, or credentials. Missing, malformed, forged, expired, wrong-issuer, and wrong-client tokens fail closed; a verified token still needs the matching client role.

At the current handoff, Docker Desktop's Linux engine runs but contains no SecureDocs container or volume. STEP 3 was verified under a different Windows profile (`C:\Users\LENOVO`), whose data is not present on this host. The user authorized a replacement realm, but this branch contains only non-realm code; live login and Guardian/QEA are not yet verified. See [the STEP 5 implementation report](docs/STEP5_IMPLEMENTATION_REPORT.md) for exact evidence and continuation steps.

## SecureDocs local development (STEP 3)

Windows PowerShell and VS Code terminal; development only. See the
[environment verification report](docs/STEP3_ENVIRONMENT_REPORT.md) for tested
results and the historical authentication-ready state. The current Docker engine
was inspected and found empty; creating a replacement realm was authorized but
is deferred while the non-realm STEP 5 branch is published.

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

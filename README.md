# SecureDocs

> Synthetic document sharing with protected reads reserved for verified, collectively governed access.

## Project overview

**Vision & originality.** SecureDocs lets people discover useful document metadata while sensitive note bodies remain unavailable until a future TideCloak-authorized permission grant is verified by the server.

**Trust constraint.** A conventional privileged administrator could grant access alone. The target STEP 5 demonstration uses TideCloak QEA so a document-role change is not committed by one administrator acting unilaterally.

**Value & impact.** Research, community, and review teams can share enough context for someone to request access without prematurely exposing the underlying material.

**Why TideCloak matters.** TideCloak is intended to govern the permission grant and supply the verified identity/role used by the server. STEP 4 does not claim this integration is complete: its adapter denies every protected read until real verification replaces it.

**Prototype & storytelling.** The responsive app includes a synthetic document register, a locked-document screen, a public reader, an in-memory demo-note form, an honest authentication-status page, and APIs that return metadata while denying protected content.

## STEP 4 application

Requirements: Node.js 20.9 or later and npm. The verified implementation used Node.js 24.21.0 and npm 11.19.0.

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

Open <http://127.0.0.1:3000/>. If that port is occupied, run `npm run dev -- --port 3122` and use the printed URL.

The create-note screen is deliberately an in-memory synthetic demo: refreshing removes the draft. Do not enter real or confidential information. The app does not commit `tidecloak.json`, tokens, or credentials, and it does not yet provide TideCloak sign-in. Protected API reads return `401` while the STEP 4 deny-by-default adapter is active. See [the STEP 4 implementation report](docs/STEP4_IMPLEMENTATION_REPORT.md) for evidence and limitations.

## SecureDocs local development (STEP 3)

Windows PowerShell and VS Code terminal; development only. See the
[environment verification report](docs/STEP3_ENVIRONMENT_REPORT.md) for tested
results and authentication readiness. STEP 4 adds the application above while
preserving the verified TideCloak environment setup in this section.

Current verified realm: `securedocs`. Its linked Tide administrator can use
<http://127.0.0.1:8080/realms/securedocs/tide-console/>. Enrollment and a console
login session are verified; the three-Guardian quorum is not configured yet.

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

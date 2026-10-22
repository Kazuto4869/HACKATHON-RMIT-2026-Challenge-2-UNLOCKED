# STEP 3 environment verification — SecureDocs

Verified on 22 October 2026, Asia/Saigon (UTC+7); enrollment follow-up checked
around 12:40. **Overall: COMPLETE for STEP 3 environment and authentication readiness.**
The local server, AGY/Raziel integration, SecureDocs realm, linked Tide admin,
unexpired license metadata, and active Tide console login are verified.
Application-user login in a SecureDocs app and Guardian quorum enforcement have
not been tested; no STEP 4 implementation was performed.

## Enrollment follow-up — current status

After the user completed the official browser wizard, read-only authenticated
checks confirmed:

- Realm `securedocs` exists and is enabled; its Tide identity provider is enabled.
- <http://127.0.0.1:8080/realms/securedocs/tide-console/> returns HTTP 200.
- One enabled user has a populated `tideUserKey` and holds the `tide-realm-admin`
  client role on `realm-management`. No identity keys or tokens were saved.
- That user has one active session associated with `tide-admin-console`,
  corroborating the user's report of successful browser login.
- The official `vendorResources/getLicenseDetails` read endpoint returned
  `currentUserAcc=1`, `expiryDate=1795325658` (2026-11-22 05:34:18 UTC), and
  `vrkExpiry=1795930451` (2026-11-29 05:34:11 UTC). Both expiries are in the future
  at verification. The response does not expose a plan name or user-capacity
  field, so neither is claimed as verified.
- `securedocs-client` is an enabled public OIDC client with standard flow and
  registered redirects under `http://127.0.0.1:8080/securedocs-client`.
  A separate `tide-admin-console` client covers the actual console origin.

No new realm, role grant, approval, or client modification was performed by this
follow-up. There is only one QEA administrator, so the desired 2-of-3 Guardian
property remains unconfigured and untested. No STEP 3 enrollment blocker remains.
The original diagnostics below are retained as the pre-enrollment snapshot.

## Phase results

| Phase | Result | Evidence | Files modified | Next action |
| --- | --- | --- | --- | --- |
| A — diagnostics | PASS | Node/npm/npx work; Docker server 27.2.0 responds after Desktop startup; WSL 2 available | None | Preserve the working Linux context |
| B — TideCloak | PASS | Container running; loopback port 8080; named H2 volume; root HTTP 200 reaches TideCloak Dashboard; bootstrap completes after ownership fix | README.md documents startup and repair | Open the setup wizard |
| C — AGY CLI | PASS | 1.4.4 at initial/interactive checks, 1.4.5 at final version check; help, interactive launch, and authenticated print request work from this repo | None in repository | Use VS Code terminal; no IDE installation needed |
| D — Raziel MCP | PASS | `/mcp` shows connected server and tools; AGY executed two real successful MCP calls | .agents/mcp_config.json; user-global MCP config outside Git | Keep normal interactive permissions for future work |
| E — realm/authentication | PASS | securedocs realm enabled; linked Tide admin; active tide-admin-console session; license metadata has future expiry | This report | Preserve the realm; Guardian configuration belongs to a later step |
| F — handoff | PASS | Report and README record verified results and limitations | This report, README.md, .gitignore | No STEP 4 implementation authorized here |

## Repository and toolchain

The existing checkout was preserved. Initially only README.md was tracked. The
three C2 planning documents and Skills/ were already untracked and were left
untouched. There is no package.json, application source, or root AGENTS.md.
Skills/AGENTS.md is scoped to that separate directory, which was not edited.
This agent created no repository, scaffolded no application, and made no commits
or history changes. During execution, a separate commit `fd5835a` (message `.`)
appeared above `286eea3` and tracked the previously untracked planning/skills
material and MCP configuration. This external change was preserved. Final
uncommitted changes are README.md, .gitignore, and this report; the MCP file
created in this session is already included in that separate commit.

| Component | Observed version/status |
| --- | --- |
| Node.js | v24.11.0 |
| npm | 11.6.1 |
| npx | 11.6.1 |
| Docker client and Engine | 27.2.0, API 1.47, linux/amd64 Engine |
| Docker Desktop | 4.34.3 (170107) |
| Docker context | desktop-linux |
| WSL | 2.4.13.0; default distribution docker-desktop, default version 2 |
| WSL kernel | 5.15.167.4-1 |
| AGY CLI | Initially 1.4.4; final `agy --version` returned 1.4.5; no installer/update command executed by this agent |
| AGY executable | C:\Users\LENOVO\AppData\Local\agy\bin\agy.exe |
| TideCloak runtime | Keycloak 26.7.5 / Quarkus 3.33.4, as reported by container |
| Remote Raziel | @tideorg/mcp 1.9.33, MCP protocol 2024-11-05 negotiated |

Commands run included `node -v`, `npm -v`, `npx --version`, `docker version`,
`docker info`, `docker ps`, `docker context ls`, `wsl --status`, `wsl --version`,
`wsl --list --verbose`, `agy --version`, `agy --help`, and `agy mcp list`.

## Docker diagnosis and local server

Initially no Docker Desktop process was running, its service was stopped, and
docker-desktop WSL was stopped. The CLI alone worked. Engine requests failed:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

Started the installed Docker Desktop with PowerShell:

```powershell
Start-Process -FilePath 'C:/Program Files/Docker/Docker/Docker Desktop.exe' -WindowStyle Hidden
```

One early retry returned `Internal Server Error` while the engine was starting.
Subsequent `docker version`, `docker info`, and `docker ps` succeeded before
container creation. If it recurs, open Start > Docker Desktop, wait until its
Engine is running, use Linux containers and the WSL 2 engine, then repeat these
three checks. No WSL reinstall, distribution reset, or Docker data reset was used.

Before creation: no containers, no volumes, no listener on port 8080. Created:

| Setting | Verified value |
| --- | --- |
| Container | securedocs-tidecloak |
| Container ID prefix | f1edc412bec7 |
| Image | tideorg/tidecloak-dev:latest |
| Image digest | sha256:3f52d0bc3e4e3ae5153e172960003bbe94705cd40af6561fd4c7c4434aaa2708 |
| Published port | 127.0.0.1:8080 -> container 8080/tcp |
| Persistent volume | securedocs_tide_data, local driver |
| Database mount | /opt/keycloak/data/h2 |
| Container user | UID 1000, group 0 |
| Local URL | http://127.0.0.1:8080/ |
| Final root response | HTTP 200, redirected to /realms/master/tide-console/; referenced JS/CSS assets also HTTP 200 |
| HTML title | TideCloak Dashboard |

Ports 8443 and 9000 are exposed inside the image but were not published to the
host. The image's internal `prod` runtime profile appears in its normal startup
logs; this remains a local development deployment using the official dev image.

The first start exited with code 1 because the new, empty named volume belonged
to root and UID 1000 could not write its H2 database:

```text
java.nio.file.AccessDeniedException: /opt/keycloak/data/h2/keycloakdb.trace.db
ERROR: Failed to obtain JDBC connection
ERROR: Could not open file /opt/keycloak/data/h2/keycloakdb.mv.db [2.4.240/1]
```

Inspected the mount read-only and verified it was empty and root-owned. A
UID-1000 `test -w /inspect` returned exit 1. Changed only the mounted directory's
owner with a temporary helper container:

```powershell
docker run --rm --user 0 --entrypoint /bin/sh `
  --mount type=volume,source=securedocs_tide_data,target=/inspect `
  tideorg/tidecloak-dev:latest -c 'chown 1000:0 /inspect'
docker start securedocs-tidecloak
```

The same UID-1000 write check then passed. No volume or database was removed,
and the original container was reused. A transient HTTP 503 occurred during
database bootstrap; subsequent HTTP requests succeeded. Current-start logs
showed successful schema initialization, realm import, temporary admin creation,
and `Bootstrap completed`. Final current-start log inspection found zero ERROR
or FATAL severity entries and no AccessDeniedException. Historical failure logs
remain available for diagnosis.

The bootstrap admin password was supplied by the user and temporarily accepted
at their explicit request despite its weakness. Its value is absent from these
files. It was passed by process environment and removed from that process after
container creation. Docker administrators can still inspect container environment
variables. Rotate the actual admin account password before real data or shared
use; changing bootstrap environment variables alone does not rotate an account.

## AGY and Raziel evidence

The CLI already existed. An interactive `agy` session opened in this repository
and reached its signed-in prompt using existing authentication. No Google login
or private-token access was automated.

Workspace configuration was created with the required AGY schema:

```json
{
  "mcpServers": {
    "tide-raziel": {
      "serverUrl": "https://mcp.tide.org/mcp"
    }
  }
}
```

There were no existing workspace servers to merge. JSON parsing and the exact
remote entry were asserted with Node. The installed CLI initially reported
`No MCP servers configured.` despite the workspace file. Its supported
`agy mcp add tide-raziel https://mcp.tide.org/mcp` registered the server in
`~/.gemini/config/mcp_config.json`; that file was initially empty. The generated
entry uses `serverUrl` and `disabled: false`. This user-global setting affects
other AGY workspaces too. It contains no credentials.

`agy mcp list` then returned:

```text
NAME         TYPE  STATUS   COMMAND/URL
tide-raziel  http  enabled  https://mcp.tide.org/mcp
```

Opened the interactive `/mcp` manager. After initialization it showed a check
mark for tide-raziel and tools including tide_list, tide_canon, tide_playbook,
tide_skill, tide_prompt, and 17 more. This verifies discovery, separately from
the successful requests below.

| Client | Actual request | Observed result |
| --- | --- | --- |
| Direct HTTP MCP diagnostic | initialize | HTTP 200; server @tideorg/mcp 1.9.33 |
| Direct HTTP MCP diagnostic | tools/list | Successful tool schemas returned |
| Direct HTTP MCP diagnostic | tide_playbook, name=initialize-admin-and-link-account | HTTP 200; enrollment/bootstrap instructions returned |
| AGY CLI | tide_list, category=playbooks | DONE; returned 19 named playbooks including bootstrap-realm-from-template and initialize-admin-and-link-account |
| AGY CLI | tide_playbook, name=initialize-admin-and-link-account | DONE; returned playbook text (301 lines / 13965 bytes in AGY's local tool output) |

AGY verification conversation: `9cf737f9-069f-41c5-bf48-1f97cf5bd76b`.
Its structured event stream recorded `call_mcp_tool` with `ServerName` set to
`tide-raziel`, both tool states DONE, and a final SUCCESS result.

An initial 40-second print attempt timed out without evidence. A later normal
headless call reached the MCP tool but was auto-denied because headless mode
could not display its permission prompt:

```text
permission check failed for mcp "tide-raziel/tide_list": user denied permission for mcp(tide-raziel/tide_list)
```

After the user explicitly authorized all required actions, reran only the two
read-only verification requests with the CLI's documented
`--dangerously-skip-permissions` flag for that one process. Both succeeded. No
persistent permissive policy was installed. Future interactive calls can use
the normal permission prompt. The official local npm fallback was unnecessary.

Raziel provides documentation/playbooks; it does not replace the TideCloak
authentication server. Playbook instructions were read, not executed wholesale.

## Initial realm and authentication snapshot (before user enrollment)

Using the supplied admin credentials, the documented master-realm token request
succeeded. Tokens were kept in memory, not printed or saved. Authenticated,
read-only admin API inspection found:

| Prerequisite | Verified result |
| --- | --- |
| Bootstrap master-admin credentials | Working token acquisition; this is not a Tide app-user login |
| Existing realms | master and myrealm, both enabled |
| Source of myrealm | Imported automatically by the dev image, as logged |
| Tide IdP in myrealm | alias=tide, providerId=tide, enabled=true |
| Users in myrealm | Empty list; no linked/enrolled admin or app user demonstrated |
| Registered sample clients | myclient, public OIDC, redirects https://test.tidecloak.com/*; mytest, public OIDC, redirects http://localhost:3000/* |
| SecureDocs-specific realm/client | Not created; samples are not proof of SecureDocs integration |
| Active license | Not verified; an enabled IdP alone does not prove licensing |
| Tide user login | Not demonstrated; enrollment still required |
| Three QEA administrators | Not enrolled/configured/tested |

The browser runtime returned `No browser is available`; troubleshooting did not
produce a browser connection. The HTTP dashboard entry was verified, but no
rendered wizard, screenshot, or browser login is claimed. Use the local URL in
your own browser for the remaining interactive setup.

### Original enrollment instructions (now completed through console login)

1. Open <http://127.0.0.1:8080/> and sign in as `admin` with your local dev password.
2. Supply the real license-management email you control and personally accept
   <https://tide.org/legal>. These answers remain pending; general permission to
   execute commands is not acceptance of the service's terms.
3. Follow the official Set up this realm wizard, using SecureDocs as the project
   name. Preserve the imported sample realm; do not reset it. Record the actual
   realm name produced by the wizard rather than assuming one.
4. Click Open the link to enroll, keep the setup tab open, and complete Tide
   account creation/linking in the enclave. Do not share the enrollment link,
   password, or recovery information in repository files.
5. In the realm console, use Advanced > Tide > Licensing to verify the active
   plan, expiry, and capacity. The official wizard normally provisions a free
   developer license; that behavior has not yet been observed for SecureDocs.
6. Inspect Apps for a client with the intended redirect origin. The imported
   myrealm/myclient already allows the hosted test origin, but it has no enrolled
   user. For a newly provisioned realm, follow the official Register an app flow
   for `https://test.tidecloak.com` if needed. No app feature code is required.
7. At <https://test.tidecloak.com/>, set TideCloak URL to the local server, Realm
   to the verified realm, and Client to its actual test client ID. Save, Sign in,
   and complete Tide authentication. Record the real success/error before
   marking login ready. If the browser blocks a local request, preserve its exact
   console/network error; do not weaken browser security to bypass it.

### Verified prerequisites for the next step (no quorum changes applied)

Official QEA documentation defines the quorum as
`max(1, floor(0.7 * N))` for the number of `tide-realm-admin` holders. Three
administrators therefore require two approvals; one or two administrators still
require only one. The `master` realm is exempt from QEA and cannot establish the
desired Guardian property.

The Raziel playbook clarifies that `tide-realm-admin` is a **client role on
realm-management**, not an ordinary realm role. Later administrator enrollment
must use three distinct Tide identities; granting additional admin roles is
itself governed. Follow the console flow and enclave approval prompts rather
than automating approvals or treating UI labels as actual admin memberships.

QEA governs permission/role changes. It is distinct from approving every
document-open action. Later validation must show that one Guardian approval
leaves a grant unapplied, a distinct second approval commits it, and refreshed
requester claims reflect it. No such grant, quorum change, Guardian UI, or custom
backend was implemented in STEP 3. No encryption guarantee has been established.

## Final verification and limitations

- Node/npm/npx, Docker Engine, container binding/mount, dashboard HTTP, bootstrap
  admin authentication, realm inventory, AGY CLI, and real AGY MCP calls checked.
- MCP JSON syntax and required schema checked with Node assertions.
- Git diff and whitespace checks performed; original untracked material preserved.
- No application build/tests exist to run in this checkout. No production,
  vulnerability, encrypted-document, or Guardian enforcement testing performed.
- Enrollment and console login were verified in the follow-up at the top of this
  report. A separate hosted test-app login was not run; registered client settings
  and the actual Tide console session establish STEP 3 authentication readiness.

## Authoritative references consulted

- [TideCloak application quickstart](https://docs.tide.org/get-started/Tidecloak%20Quickstart)
- [TideCloak admin quickstart and browser wizard](https://docs.tide.org/Admin/Quick-deploy-test)
- [License management](https://docs.tide.org/Admin/license)
- [QEA administrator setup](https://docs.tide.org/Admin/SetupIGA)
- [QEA threshold and master-realm exception](https://docs.tide.org/Core-Concepts/iga-workflow)
- [Tide Raziel MCP](https://tide.org/agent-plugins)
- [Official Raziel repository](https://github.com/tide-foundation/raziel-mcp)
- [Antigravity CLI MCP configuration](https://antigravity.google/docs/mcp?tab=cli)
- [Antigravity CLI reference](https://antigravity.google/docs/cli/reference/)

The supplied `www.antigravity.google` reference was inaccessible to the web
reader; the official `antigravity.google` documentation was accessible and
confirmed `.agents/mcp_config.json`, `serverUrl`, and `/mcp` for CLI use.

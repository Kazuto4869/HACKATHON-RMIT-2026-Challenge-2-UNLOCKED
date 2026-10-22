# C2 — Step 3: Node.js, Docker, TideCloak, Raziel MCP trong Antigravity

**Dự án:** SecureDocs (đã có Git repository)  
**Mục tiêu của bước này:** xác minh Node.js/npm, khởi chạy một TideCloak dev instance bằng Docker và kết nối Raziel MCP vào Google Antigravity (AGY). **Không tạo repository mới, không thay đổi các tính năng ứng dụng ở bước này.**

## 0. Kết quả cần có

- [ ] `node -v`, `npm -v`, `npx --version` chạy được trong PowerShell/terminal của AGY.
- [ ] Docker Desktop chạy Linux containers; `docker info` không báo lỗi daemon.
- [ ] TideCloak dev container đang chạy; mở được `http://localhost:8080/`.
- [ ] AGY kết nối được MCP server `tide-raziel` và gọi được tool đọc tài liệu/playbook của Tide.
- [ ] Ghi lại trong `docs/C2_STEP3_STATUS.md` các kết quả thực tế, lỗi và việc còn lại.

## 1. Node.js trên Windows

1. Mở https://nodejs.org/en/download và cài phiên bản **LTS** cho Windows; npm đi cùng Node.js. Nếu máy đã có Node.js phù hợp, không cài lại.
2. Đóng và mở lại PowerShell / terminal của AGY sau cài đặt.
3. Chạy:

```powershell
node -v
npm -v
npx --version
where.exe node
```

Đạt khi ba lệnh phiên bản đều in kết quả và `where.exe node` tìm được executable. Nếu không nhận lệnh, kiểm tra `PATH`, khởi động lại terminal; tránh cài đồng thời nhiều bản Node không cần thiết.

## 2. Docker Desktop + WSL2

1. Nếu chưa cài, dùng hướng dẫn chính thức: https://docs.docker.com/desktop/setup/install/windows-install/
2. Mở PowerShell và chạy `wsl --version`. Nếu WSL chưa cài, chạy PowerShell **Run as administrator** và `wsl --install` (có thể cần khởi động lại Windows); nếu quá cũ, `wsl --update`.
3. Cài Docker Desktop, khởi động ứng dụng và bật **WSL 2 based engine** / Linux containers nếu được hỏi.
4. Xác minh:

```powershell
wsl --version
docker --version
docker info
docker ps
```

`docker --version` chỉ xác nhận có CLI; `docker info`/`docker ps` mới xác nhận engine đang hoạt động.

## 3. Chạy TideCloak development server

Chỉ thực hiện khi Docker Engine đã chạy. Sử dụng **PowerShell**, chọn mật khẩu dev riêng, không lưu trong Git:

```powershell
$env:KC_BOOTSTRAP_ADMIN_PASSWORD = Read-Host "TideCloak DEV admin password"

docker run -d `
  --name securedocs-tidecloak `
  -p 127.0.0.1:8080:8080 `
  -v securedocs_tide_data:/opt/keycloak/data/h2 `
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin `
  -e KC_BOOTSTRAP_ADMIN_PASSWORD `
  tideorg/tidecloak-dev:latest

docker ps
docker logs --tail 50 securedocs-tidecloak
```

Sau đó mở `http://localhost:8080/`. Thực hiện provisioning realm, license và Tide IDP theo hướng dẫn hoặc wizard **sau khi** xác minh instance có thể truy cập.

Nếu `docker run` báo tên container đã tồn tại, **không xóa volume**; thử `docker start securedocs-tidecloak`, rồi `docker logs --tail 50 securedocs-tidecloak`. Nếu cổng 8080 đang bận, kiểm tra `docker ps` và các tiến trình khác trước khi đổi mapping.

**Lưu ý:** `tideorg/tidecloak-dev` là bản dành cho development. Không public cổng 8080 trên Internet. Mật khẩu dùng trong máy dev không phải thông tin nộp lên GitHub.

## 4. Kết nối Raziel MCP với Antigravity (khuyên dùng remote)

Raziel là **MCP server cung cấp playbook và hướng dẫn**, không phải TideCloak server. Remote Raziel **không cần Docker hay Node.js** để tự kết nối.

Trong **Antigravity IDE**:

1. Mở repository SecureDocs.
2. Trong Agent panel, chọn `...` → **MCP Servers** → **Manage MCP Servers** → **View raw config**.
3. Mở `mcp_config.json`. Để áp dụng riêng cho repo, cũng có thể tạo `.agents/mcp_config.json` ở repo root nếu bản AGY đang dùng hỗ trợ workspace config.
4. Nếu file đã có MCP khác, **thêm** entry dưới `mcpServers`, không ghi đè các entry cũ. Cấu hình dùng schema chính thức của AGY là `serverUrl`:

```json
{
  "mcpServers": {
    "tide-raziel": {
      "serverUrl": "https://mcp.tide.org/mcp"
    }
  }
}
```

5. Lưu file và vào MCP Servers/Settings để **Refresh**. Nếu trạng thái chưa cập nhật, đóng/mở lại Agent panel hoặc reload AGY.
6. Mở một cuộc chat mới với AGY, yêu cầu:

> Verify that the `tide-raziel` MCP server is connected. List the available Tide MCP tools and call an appropriate read-only Tide playbook for setting up a TideCloak development realm and QEA. Report the tool response and exact server status. Do not change the repository or claim TideCloak integration is finished yet.

**Quan trọng:** Trang docs Raziel có ví dụ dùng khóa `url` cho MCP client chung, nhưng **Antigravity yêu cầu `serverUrl`** cho remote connection. Đừng copy trực tiếp `url` từ ví dụ Tide sang AGY.

### Fallback: local Raziel bằng npx

Chỉ dùng nếu remote MCP không kết nối được và Node.js đã hoạt động. Trong cùng file `mcp_config.json`, **thay** entry `tide-raziel` bằng:

```json
{
  "mcpServers": {
    "tide-raziel": {
      "command": "npx",
      "args": ["-y", "@tideorg/mcp"]
    }
  }
}
```

Trên Windows nếu AGY báo không tìm được `npx`, xác minh `where.exe npx`; chỉ chuyển sang đường dẫn tuyệt đối đến `npx.cmd` sau khi biết đường dẫn thực tế. Không chạy đồng thời cả hai kiểu transport dưới cùng tên.

## 5. Handoff cho AGY sau khi environment đã đạt

```text
We already have an existing SecureDocs Git repository. Do not scaffold a new repository or overwrite source files.

Goal of Step 3 only: verify the local Node.js/npm toolchain, confirm the TideCloak Docker development server at http://localhost:8080/, and use the connected Tide Raziel MCP to identify the official setup playbooks for a TideCloak realm with QEA.

Tasks:
1. Inspect package.json, framework and current repo without destructive edits.
2. Report actual versions of Node, npm, Docker and the TideCloak container status.
3. Using Raziel MCP, retrieve official guidance for realm provisioning, first admin, QEA, adding two more tide-realm-admin users, and approval workflow.
4. Identify any manual browser enrollment/license steps requiring human action.
5. Write a concise docs/C2_STEP3_STATUS.md report with PASS/FAIL and evidence.

Stop before implementation of document pages, guardian approval UI or feature code. Do not claim the 2-of-3 quorum works until it has been configured and tested.
```

## 6. Step 3 acceptance gates

**G1:** Node/npm OK; **G2:** Docker Engine OK; **G3:** TideCloak reachable; **G4:** Raziel MCP tool actually invoked by AGY; **G5:** AGY produces verified setup status. Only then proceed to realm/QEA configuration and the next build step.

## Official references

- https://antigravity.google/docs/mcp
- https://docs.tide.org/ai-agent-pack
- https://docs.tide.org/get-started/Tidecloak%20Quickstart
- https://docs.docker.com/desktop/setup/install/windows-install/
- https://docs.tide.org/Admin/SetupIGA

# Đưa website SecureDocs lên Render

**NHÁP — người dùng đã hoãn Render để hoàn tất demo local. Chưa deploy hoặc publish nhánh Render; không thực hiện các bước này cho đến khi quay lại phần cloud.**

## Bản nào được deploy?

Next.js **Node Web Service**, không phải Static Site hay GitHub Pages. Website có API và server-side authorization; GitHub Pages không chạy backend Node này.

`render.yaml` khai báo service **Free** để thử giao diện/tài liệu public. Không tự bật dịch vụ/disk trả phí. Repo không chứa `.env.local`, `tidecloak.json` hoặc database local.

## Cách nhanh bằng Dashboard

1. Mở <https://dashboard.render.com/>. Đăng nhập bằng GitHub và cho Render quyền đọc repo `Kazuto4869/HACKATHON-RMIT-2026-Challenge-2-UNLOCKED`.
2. Chọn **New → Web Service**, chọn repo này.
3. Điền:

| Trường | Giá trị |
|---|---|
| Name | `securedocs-web` (hoặc tên chưa bị dùng) |
| Branch | `codex/securedocs-step6-render` |
| Language / Runtime | **Node** — chọn Node nếu Render tự phát hiện Dockerfile |
| Root Directory | để trống |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run start` |
| Instance Type | **Free** |
| Health Check Path | `/api/documents` |
| Environment variable | `NODE_VERSION` = `24.11.0` |
| Environment variable | `NODE_ENV` = `production` |

4. Không đặt `SECUREDOCS_STANDALONE=1`: flag đó chỉ dành cho Docker image. Không đặt PORT cố định; Next.js dùng PORT Render cấp.
5. Với bản preview, **không thêm các biến `NEXT_PUBLIC_TIDECLOAK_*` trỏ về localhost**, và không upload file adapter local. Thiếu cấu hình, các nội dung protected vẫn bị khóa đúng thiết kế.
6. Bấm **Deploy Web Service**. Theo dõi Logs. Chỉ khi deploy Live và URL Render trả HTTP thành công mới coi deployment hoàn tất.
7. Mở URL `https://<tên-service>.onrender.com` mà Dashboard cấp. Tên URL thực tế có thể khác Name. Gửi **URL website công khai hoặc lỗi build đã bỏ thông tin nhạy cảm** cho Codex để kiểm tra tiếp, không gửi token.

Cách khác: **New → Blueprint**, chọn repo và đúng branch, đọc `render.yaml`, kiểm tra chỉ có một Free Web Service rồi deploy. Không chọn các tài nguyên trả phí.

## Kiểm tra sau deploy

- Trang chính mở được, search hoạt động; sidebar có My Documents, Shared Requests, Guardians.
- Responsible sharing charter đọc được; tài liệu protected vẫn khóa.
- `/api/documents` trả metadata không có body.
- `/api/documents/patient-safety-brief` trả 401 khi chưa đăng nhập.
- Có thể chạy: `npm run verify:step6 -- https://<URL-thực-tế>.onrender.com`. Chạy khi service đã Live; cold start Free có thể làm request đầu chậm.

Không gắn nhãn live Tide login/Guardian approval đã pass chỉ vì giao diện lên Render.

## Để đăng nhập và dùng đầy đủ trên Render

TideCloak `127.0.0.1:8080` chỉ ở máy local. Từ Render, địa chỉ đó trỏ vào máy Render, không phải laptop của bạn. Cần một TideCloak HTTPS được triển khai riêng, dữ liệu/license được giữ bền vững và quyền truy cập được quản lý đúng; không public container dev đang dùng chỉ để thử UI.

Khi đã có server đó:

1. Trong realm/client thật, thêm redirect `https://<URL-Render>/auth/redirect`, `https://<URL-Render>/silent-check-sso.html`, Web origin `https://<URL-Render>` và post-logout URI thích hợp. Hoàn tất QEA, ký origin/IDP settings theo flow chính thức, export lại **Tide adapter**.
2. Đặt bốn biến public ở Render theo đúng server/realm/client/origin HTTPS.
3. Dùng cơ chế Secret File của Render cho `tidecloak.json` tại vị trí runtime đọc được; không commit file, không dán nội dung vào chat. Loader hiện đọc file ở root project, nên cần cấu hình mount/copy runtime cụ thể trước khi coi auth sẵn sàng. Bản preview này chưa cấu hình bước đó.
4. Cần lưu trữ bền vững cho SQLite: **Render Free mất file local khi redeploy/restart/spin-down và không có persistent disk**. Không dùng bản Free này làm nơi giữ notes/requests. Muốn triển khai có persistence, chọn phương án disk trả phí hoặc chuyển datastore có chủ đích sau khi thống nhất; chưa tự động nâng gói hay thêm database khác.
5. Chạy login/logout, owner create/read, requester denied, request-only-still-denied và QEA 0/2 → 1/2 → 2/2 trước khi công bố demo tích hợp.

## Lỗi thường gặp

- **Static export / API mất:** chọn nhầm Static Site. Tạo Node Web Service.
- **`Cannot find node:sqlite`:** Node version sai; cần Node 24.11+.
- **Tailwind/TypeScript missing khi build:** Build command phải có `npm ci --include=dev`.
- **Chỉ có `.next/standalone` và lỗi start:** bỏ `SECUREDOCS_STANDALONE` trên Native Node Render rồi redeploy; Docker dùng entrypoint riêng.
- **Invalid redirect / origin chưa verified:** không đổi 127.0.0.1 thành URL cloud bằng phỏng đoán. Cập nhật, QEA-commit, sign origin và re-export adapter thật.
- **Mất note sau restart:** giới hạn filesystem ephemeral của Free, không phải đồng bộ từ database local.

Nguồn: [Render Next.js](https://render.com/docs/deploy-nextjs-app), [Blueprint reference](https://render.com/docs/blueprint-spec), [Free limitations](https://render.com/docs/free), [GitHub Pages là static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

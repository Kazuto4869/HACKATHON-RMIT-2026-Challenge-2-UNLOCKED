# SecureDocs: đăng nhập website và thêm hai Guardian

Hướng dẫn cho môi trường local. Không gửi mật khẩu, token, link enrollment hoặc recovery key vào chat, Git hay ảnh demo.

## 1. Mở Tide Console

Mở <http://127.0.0.1:8080/realms/securedocs/tide-console/> và đăng nhập bằng **Tide account đã liên kết** của admin hiện có. Đây là tài khoản khác với bootstrap admin dùng ở trang gốc.

Server chỉ lắng nghe trên `127.0.0.1`. Mỗi người dùng một browser profile riêng trên **máy đang chạy Docker**, hoặc lần lượt dùng cửa sổ riêng và đăng xuất hoàn toàn. Mỗi Guardian tự tạo và giữ tài khoản của mình. Nhiều tab cùng một tài khoản không tạo ra nhiều Guardian. Không mở port/tunnel công khai chỉ để enrollment.

## 2. Cho website cổng 3000 đăng nhập

Trong **Apps → securedocs-client**, mở phần cấu hình URL/Settings. **Giữ các URL cũ**, thêm:

| Trường | Thêm giá trị |
|---|---|
| Valid redirect URIs | `http://127.0.0.1:3000/auth/redirect` |
| Valid redirect URIs | `http://127.0.0.1:3000/silent-check-sso.html` |
| Valid post logout redirect URIs | `http://127.0.0.1:3000/*` |
| Web origins | `http://127.0.0.1:3000` |

Client phải là public client, bật Standard flow. Không bật Direct access grants để thay thế đăng nhập Tide. Không dùng wildcard cho Web origins. Dùng đúng `127.0.0.1`, không đổi sang `localhost` giữa chừng.

Save. Nếu thay đổi vào **QEA Approvals**, mở yêu cầu, đọc nội dung và **Authorize** qua enclave. Hiện chỉ một admin nên một approval có thể áp dụng; đây chưa phải bằng chứng 2-of-3.

Save chưa đồng nghĩa cấu hình có hiệu lực: phải chờ yêu cầu chuyển **APPROVED/committed**. Chỉ approve thay đổi bạn đã đọc và hiểu.

Sau khi commit origin mới, cần ký lại IDP settings theo console/flow chính thức và export lại **Tide adapter**, có `jwk` và `client-origin-auth-http://127.0.0.1:3000`. Codex có thể kiểm tra/export adapter bằng API đọc, nhưng không thay bạn ký enclave. Endpoint export đúng là `GET /admin/realms/{realm}/vendorResources/get-installations-provider?clientId={client UUID}&providerId=keycloak-oidc-keycloak-json`; endpoint installation Keycloak thông thường không có đầy đủ trường Tide. Lưu file local `tidecloak.json` (được Git ignore), không commit. Khởi động lại website sau khi export.

Sau khi website chạy bằng `npm run dev`, mở <http://127.0.0.1:3000/> → **Sign in**. Nếu báo invalid redirect, kiểm tra lại URL và yêu cầu QEA đã commit chưa. **Account status** hiển thị trạng thái phiên thật.

## 3. Người thứ hai tạo Tide account

Nếu tạo account báo `Could not reach enough NEW ORKs (got 2 of 20 required, 18 of 20 failed)`, flow chưa tạo/link thành công. Đây không phải quorum Guardian 2/3. Có thể thử mạng khác, giữ máy chạy Docker và mở lại link trên chính máy đó; hoặc liên kết Tide account riêng đã có thay vì tạo mới. Chưa xác định lỗi mạng hay ORK nếu chưa có domain/status của request thất bại. Không hạ threshold hoặc dùng chung một Tide account cho nhiều Guardian. Không gửi URL enclave có session/query vào chat; khi chẩn đoán chỉ lấy domain, HTTP status và mã lỗi.

Trong phiên local này, hai link enrollment mới đã được tạo bằng endpoint chính thức và lưu riêng tại `.data/guardian-enrollment.private.html` (Git ignore, không phục vụ qua website). Mở file này trên máy chạy Docker, chọn đúng `Enroll guard2` hoặc `Enroll guard3` trong browser profile riêng của từng người. Link có hạn 12 giờ từ lúc tạo. Không gửi file/link lên Git hay chat. Username realm `guard2`/`guard3` chưa phải tài khoản đăng nhập Tide: phải hoàn tất liên kết qua link trước; khi enclave yêu cầu đăng nhập, dùng Tide account riêng đã có hoặc chọn tạo tài khoản mới trong flow enrollment. Không dùng tài khoản admin ban đầu cho cả hai người.

**Trạng thái đã kiểm tra trên máy này:** `guard2`, `guard3`, `guard4` đã được tạo. Không tạo thêm bản trùng. Dùng `guard2` và `guard3` cho hai Guardian bổ sung; `guard4` có thể làm requester thường. Hiện chỉ admin ban đầu đã linked và có role admin. Mở user đã có trong **Users** (bản console này dùng nhãn Users thay vì People), lấy/tiếp tục enrollment trong phần liên kết Tide của user đó và để đúng người tự hoàn tất. Không cấp cả ba user mới làm admin: mục tiêu là đúng ba admin gồm admin hiện tại + hai người bổ sung.

Nếu chưa có user ở một môi trường mới, admin hiện có thực hiện:

1. **People → Add a user**. Đặt username dễ phân biệt, ví dụ `guardian-2`.
   Nếu `CREATE_USER` đang chờ QEA, hoàn tất approval/commit trước khi coi tài khoản đã được tạo.
2. Console hiển thị **link enrollment một lần**. Cho đúng người thứ hai mở riêng link đó. Không lấy URL đăng nhập thông thường làm link enrollment.
3. Người thứ hai chọn tạo Tide account trong enclave (hoặc đăng nhập Tide account riêng nếu đã có), đặt thông tin đăng nhập và tự lưu recovery information. Hoàn tất liên kết, không chỉ dừng ở màn hình tạo tài khoản.
4. Admin kiểm tra user đã linked/enrolled trong People.
5. Bật **Advanced**. Trong Roles hoặc People → user → Role mapping, cấp **client role `tide-realm-admin` thuộc client `realm-management`**. Không tự tạo realm role trùng tên.
6. Mở **QEA Approvals**, đọc yêu cầu cấp admin vừa sinh và Authorize bằng admin đang có quyền. Chờ trạng thái committed; một user được tạo chưa đồng nghĩa đã thành admin.
7. Người thứ hai dùng profile riêng đăng nhập URL console ở mục 1 để xác nhận quyền thật.

## 4. Người thứ ba

Lặp lại mục 3 với user `guardian-3`, Tide account và link enrollment riêng. Việc cấp admin là thay đổi được quản trị; hoàn tất yêu cầu QEA thay vì chỉ nhìn label trên UI.

Sau đó xác nhận **ba user khác nhau đã liên kết Tide và có role `realm-management/tide-realm-admin`**. Quorum mặc định được tài liệu mô tả là `max(1, floor(0.7 × N))`: N=3 cần 2 approvals. Kiểm tra thực tế trên console; hai admin vẫn chưa chứng minh thuộc tính 2-of-3.

## 5. Tài khoản requester và role đọc tài liệu

Tạo thêm user thường bằng **People → Add a user**, cho requester tự enrollment tương tự; **không cấp role admin**. Dùng profile riêng để đăng nhập website.

Trong app `securedocs-client`, chuẩn bị các **client role** sau (tạo role và các thay đổi liên quan có thể cần QEA):

| Tài liệu | Role đọc |
|---|---|
| Patient safety brief | `doc_read_patient_safety_brief` |
| Coastal resilience field notes | `doc_read_coastal_resilience_notes` |
| Funding review memo | `doc_read_funding_review_memo` |

Role không được đặt làm default role, hoặc gán cho cả nhóm/all users. Với note mới, tên role là `doc_read_` + UUID tài liệu bỏ dấu `-`; lấy UUID từ URL tài liệu. Website chỉ kiểm tra quyền, **không tự tạo/gán role**. Owner đã được xác minh có quyền đọc note do chính mình tạo; requester cần role riêng cho note đó.

Đảm bảo access token của app có client roles tại `resource_access[securedocs-client].roles` theo client-scope/role mapper thật của realm. Đừng sửa JWT hoặc dán token vào công cụ trực tuyến.

Trang Guardians trong website chỉ hiện review queue nếu token đã xác minh có client role `realm-management/tide-realm-admin`. Nếu admin vào website mà queue báo thiếu quyền, kiểm tra App scopes/role mapper cho **tài khoản admin đó**. Không gán admin role cho tất cả người dùng để sửa lỗi. Queue chỉ là bàn giao ticket; quyền đọc và quyết định QEA thật phải kiểm tra ở Tide Console.

## 6. Chứng minh 0/2 → 1/2 → 2/2

1. Requester chưa có role mở Patient safety brief: nội dung khóa. **Request access** chỉ tạo ticket, không cấp quyền.
2. Admin đề xuất gán **đúng role của tài liệu** cho requester tại People/Role mapping. Mở yêu cầu **PENDING** trong QEA Approvals.
3. Guardian A tự đăng nhập console, đọc yêu cầu và Authorize qua enclave. Chỉ một người approve: requester **vẫn bị từ chối**.
4. Guardian B khác người A tự đăng nhập và Authorize cùng yêu cầu. Chờ Tide commit sau đủ quorum.
5. Requester bấm **Refresh access**; nếu role chưa cập nhật thì đăng xuất/đăng nhập lại. API phải trả 200 cho tài liệu được cấp, còn tài liệu protected khác vẫn 403.
6. Chỉ ghi kết quả đã quan sát: thời điểm, tài liệu, số admin, trạng thái yêu cầu và HTTP status. Không chụp token, link enrollment hay recovery key.

QEA phê duyệt **thay đổi role**, không yêu cầu hai Guardian approve mỗi lần mở note. Phê duyệt bằng app-local counter hoặc tài khoản giả không hợp lệ.

## Khi cần báo lại Codex

Báo: đã sửa URL app chưa; số Guardian đã linked và được cấp role; thông báo lỗi nguyên văn đã bỏ thông tin nhạy cảm. Không cần gửi thông tin đăng nhập. Chưa đủ ba người, license/enclave lỗi hoặc chưa commit role thì phần live QEA vẫn BLOCKED.

## Lỗi `No approvals from the enclave within 300s`

Đây là timeout chờ chữ ký enclave, **không phải thiếu curl**. Kiểm tra trên máy này cho thấy các yêu cầu vẫn PENDING, authorizationCount=0, threshold=1; bấm Bulk authorize lại không sửa được nguyên nhân.

1. Trong Chrome/Edge, ở thanh địa chỉ mở biểu tượng pop-up bị chặn → luôn cho phép pop-up và redirect cho `http://127.0.0.1:8080`. Xem [hướng dẫn popup chính thức](https://tide.org/allow-popups).
2. Cho phép quyền lưu trữ/cookie của site khi trình duyệt hỏi; không tắt bảo vệ toàn bộ trình duyệt. Enclave dùng iframe và có thể chuyển sang pop-up nếu iframe/storage bị chặn.
3. Reload console, kiểm tra vẫn đăng nhập. Mở **một** yêu cầu, đọc action/target, bấm Authorize và giữ cửa sổ enclave mở. Hoàn tất đăng nhập/xác nhận ở đó, không chỉ ở tab console.
4. Chờ request committed/APPROVED. Nếu vẫn timeout, ghi lại thông báo trên **cửa sổ enclave** và việc pop-up có mở được hay không. Không chụp token/link enrollment/recovery key.
5. Không dùng curl/REST approval trống để giả chữ ký, không tắt QEA, không reset realm. MultiAdmin cần người thực sự xác nhận qua enclave.

Nguồn lỗi: Raziel `tide_canon("troubleshooting", section="T-27")` và playbook `setup-iga-admin-panel`. Khả năng pop-up/storage bị chặn là hướng chẩn đoán; timeout tự nó chưa chứng minh nguyên nhân duy nhất.

## Cấu hình local đã được áp dụng trong phiên này

Sau khi user ký các đề xuất sạch, kiểm tra server xác nhận rootUrl `http://127.0.0.1:3000`, hai callback cổng 3000, Web origin 3000, PKCE S256 và ba role đọc seed note đều đã có hiệu lực. Adapter đã được export lại với origin 3000 đã ký. OIDC authorization request dùng callback này và PKCE được chấp nhận, HTTP 303; đó chưa phải bằng chứng user đã đăng nhập website.

Hai đề xuất cũ (rootUrl có khoảng trắng đầu và bật DPoP không khớp backend hiện tại) đã được supersede bằng Deny rồi tạo lại cấu hình đúng. Chúng còn trong lịch sử Denied, không phải realm/data bị reset. Mode thực tế vẫn là Bearer; không bật DPoP thêm qua Settings khi backend chưa hỗ trợ proof. API approval chính thức đã được gọi và trả `needs-approval`: phần ký enclave cần Tide account thật, còn đề xuất/kiểm tra/commit đủ quorum có thể tự động.

Nguồn chính thức: [Setup QEA](https://docs.tide.org/Admin/SetupIGA), [QEA workflow](https://docs.tide.org/Core-Concepts/iga-workflow), SDK `@tidecloak/nextjs@0.14.40` trong repo.

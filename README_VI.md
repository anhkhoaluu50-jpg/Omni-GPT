# Omni GPT – Gemini Backend (Cloudflare Workers)

Backend proxy cho app Android Omni GPT. Gemini API Key được lưu ở Cloudflare Worker Secret, KHÔNG đặt trong GitHub và KHÔNG nhúng vào APK.

## Triển khai từ GitHub (không cần Render)

1. Giải nén ZIP này.
2. Tạo repository mới trên GitHub, ví dụ `omni-gpt-backend`.
3. Upload 4 file ở thư mục gốc: `worker.js`, `wrangler.toml`, `package.json`, `README_VI.md`.
4. Đăng nhập Cloudflare: https://dash.cloudflare.com/ rồi mở Workers & Pages.
5. Chọn Create application → Workers → Import a repository / Connect to Git.
6. Chọn repo `omni-gpt-backend`, root directory để trống (repo root), build command để trống; deploy command `npx wrangler deploy` nếu dashboard yêu cầu. Save and Deploy.
7. Trong Worker vừa tạo, mở Settings → Variables and Secrets → Add → Secret. Tên biến: `GEMINI_API_KEY`; giá trị: Gemini API Key lấy từ https://aistudio.google.com/apikey. Save.
8. Redeploy Worker nếu dashboard yêu cầu.
9. URL sẽ có dạng `https://omni-gpt-backend.<ten-tai-khoan>.workers.dev`.
10. Endpoint chat là URL trên cộng `/api/chat`.

## Kiểm tra endpoint

Gửi POST JSON tới `/api/chat`:

```json
{"mode":"basic","prompt":"Xin chào Omni GPT"}
```

Kết quả thành công có dạng:

```json
{"answer":"..."}
```

## Giới hạn và bảo mật

- Worker không phải máy chủ chạy tiến trình nền 24/7. Đây là serverless API luôn có thể nhận request mà không cần giữ một máy ảo bật liên tục; code chỉ thực thi khi có request.
- Workers Free có giới hạn 100.000 requests/ngày (theo tài liệu Cloudflare hiện hành); giới hạn và giá có thể thay đổi.
- Không đưa Gemini API Key vào GitHub, file cấu hình, mã Android hoặc gửi trong chat. Chỉ lưu dưới dạng Secret trên Cloudflare.
- Endpoint mẫu này chưa có hệ thống tài khoản máy chủ hoặc chống lạm dụng hoàn chỉnh. Trước khi phát hành công khai, cần bổ sung xác thực, giới hạn theo người dùng/IP, quota và theo dõi chi phí.

// Service worker của Glow up with me.
// Chỉ lưu tạm file tĩnh (giao diện, hình vẽ, icon) cho nhanh, và trang "offline" khi mất mạng.
// KHÔNG lưu trang đã đăng nhập hay dữ liệu cá nhân (nhật ký, hồ sơ, thực đơn).
const VERSION = "v1";
const STATIC = `static-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Sanity, Supabase… để trình duyệt tự xử lý

  // Mở trang: luôn lấy từ mạng; mất mạng mới hiện trang offline
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // File tĩnh bất biến: ưu tiên bản đã lưu
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/minh-hoa/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});

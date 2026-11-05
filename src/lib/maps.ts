// Mở Google Maps tìm quán bán món ăn ngoài gần người dùng.
// Dùng "Google Maps URLs" (https://developers.google.com/maps/documentation/urls) — miễn phí, không cần API key.
// Google Maps (app trên điện thoại hoặc web) tự dùng vị trí trên máy người dùng; Glow up with me KHÔNG đọc hay lưu vị trí.

// Một số món nên tìm theo loại cửa hàng thay vì tên món
const QUERY_BY_SLUG: Record<string, string> = {
  "com-nam-ca-ngu": "cửa hàng tiện lợi",
  "salad-uc-ga": "cửa hàng tiện lợi",
  "sandwich-trung": "cửa hàng tiện lợi",
  "sua-chua-chuoi": "cửa hàng tiện lợi",
  "com-van-phong": "quán cơm bình dân",
  "com-chay": "quán cơm chay",
};

export function mapsQueryFor(slug: string, name: string): string {
  // Bỏ phần trong ngoặc: "Cơm văn phòng (1 mặn, rau, canh)" → "Cơm văn phòng"
  return QUERY_BY_SLUG[slug] ?? name.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

export function mapsSearchUrl(slug: string, name: string): string {
  const query = `${mapsQueryFor(slug, name)} gần đây`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

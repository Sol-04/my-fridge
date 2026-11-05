// Hình vẽ minh hoạ (public/minh-hoa/) cho món chưa có ảnh thật trong Sanity.
// Chọn theo từ khoá trong tên món — món mới thêm sau cũng tự có hình.

// Thứ tự quan trọng: quy tắc trên được ưu tiên trước.
const RULES: [RegExp, string][] = [
  [/^trung (cuon|op la|hap)/, "trung"], // "Trứng cuộn" là món trứng, không phải món cuốn
  [/^(khoai|ngo luoc)/, "khoai"],
  [/^(chao|sup|yen mach)/, "chao"],
  [/banh xeo/, "banh-xeo"],
  [/cuon/, "cuon"],
  [/banh mi|sandwich/, "banh-mi"],
  [/^xoi/, "xoi"],
  [/sinh to|sua chua/, "sinh-to"],
  [/salad|^goi /, "salad"],
  [/bun (cha|thit nuong|tron|bo xao)|(mien|pho) xao|mien .*tron/, "bun-tron"],
  [/^(pho|bun|hu tieu|mien|mi quang|banh canh)/, "to-pho"],
  [/^canh /, "canh-com"],
  [/com /, "dia-com"],
  [/^trung/, "trung"],
];

// Bỏ dấu tiếng Việt để so khớp từ khoá
function plain(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export function illustrationFor(name: string): string {
  const n = plain(name) + " ";
  for (const [re, file] of RULES) if (re.test(n)) return `/minh-hoa/${file}.svg`;
  return "/minh-hoa/mon-man.svg";
}

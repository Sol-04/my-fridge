// Gửi tin tới bot nhóm Lark / Feishu qua link webhook (chạy ở máy chủ). Link webhook là BÍ MẬT: không ghi log, không gửi về trình duyệt.
import "server-only";

// Chỉ cho phép đúng địa chỉ bot của Lark / Feishu (khớp ràng buộc trong cơ sở dữ liệu) để không bị lợi dụng gửi tới nơi khác.
const WEBHOOK = /^https:\/\/(open\.larksuite\.com|open\.feishu\.cn)\/open-apis\/bot\/v2\/hook\/[A-Za-z0-9-]{20,60}$/;

export const isLarkWebhook = (v: unknown): v is string => typeof v === "string" && WEBHOOK.test(v);

export type LarkSend = { ok: true } | { ok: false; error: string };

export async function sendLarkText(url: string, text: string): Promise<LarkSend> {
  if (!isLarkWebhook(url)) return { ok: false, error: "Link webhook chưa đúng dạng của Lark." };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "text", content: { text } }),
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { code?: number; StatusCode?: number; msg?: string; StatusMessage?: string } | null;
    const code = body?.code ?? body?.StatusCode ?? 0;
    if (res.ok && code === 0) return { ok: true };
    const reason = (body?.msg ?? body?.StatusMessage ?? "").toLowerCase();
    // 19021 = sai chữ ký, 19022 = IP không được phép, 19024 = thiếu từ khoá (mã lỗi của Lark)
    if (code === 19021 || reason.includes("sign match")) return { ok: false, error: "Bot Lark đang bật \"Ký xác thực\". Bạn tắt phần này trong cài đặt bot rồi thử lại nhé." };
    if (code === 19022 || reason.includes("ip not in")) return { ok: false, error: "Bot Lark đang giới hạn địa chỉ IP. Bạn tắt giới hạn IP trong cài đặt bot rồi thử lại nhé." };
    if (code === 19024 || reason.includes("key words")) return { ok: false, error: 'Bot Lark đang bật "Từ khoá". Bạn đặt từ khoá là Glow up hoặc tắt phần từ khoá rồi thử lại nhé.' };
    return { ok: false, error: "Lark không nhận tin. Bạn kiểm tra lại link webhook (bot còn trong nhóm không) rồi thử lại nhé." };
  } catch {
    return { ok: false, error: "Chưa gửi được tới Lark. Có thể mạng đang chậm, bạn thử lại sau ít phút nhé." };
  }
}

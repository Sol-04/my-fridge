"use server";

// Lưu hồ sơ người dùng (tên + thông tin cơ thể).
import { revalidatePath } from "next/cache";

import { parseUserInput } from "@/lib/meal-plan";
import { createSupabaseServer } from "@/lib/supabase/server";

export type ProfileInput = {
  displayName: string;
  gender: string;
  age: string;
  heightCm: string;
  weightKg: string;
  activity: string;
  goal: string;
};

export type ProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<ProfileResult> {
  const displayName = String(input?.displayName ?? "").trim().slice(0, 60);
  if (!displayName) return { ok: false, error: "Vui lòng nhập tên hiển thị." };

  // Thông tin cơ thể: được để trống, nhưng nếu nhập thì phải hợp lệ (dùng chung quy tắc với trang tạo thực đơn)
  const hasBody = [input.age, input.heightCm, input.weightKg].some((v) => String(v ?? "").trim() !== "");
  let body: ReturnType<typeof parseUserInput> = null;
  if (hasBody) {
    body = parseUserInput({
      gender: input.gender,
      age: Number(input.age),
      heightCm: Number(input.heightCm),
      weightKg: Number(input.weightKg),
      activity: input.activity,
      goal: input.goal,
    });
    if (!body) return { ok: false, error: "Tuổi, chiều cao hoặc cân nặng chưa hợp lệ. Bạn kiểm tra lại các ô màu đỏ nhé." };
  }

  const supabase = await createSupabaseServer();
  if (!supabase) return { ok: false, error: "Hệ thống đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau." };
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      gender: body?.gender ?? (input.gender === "male" || input.gender === "female" ? input.gender : null),
      age: body?.age ?? null,
      height_cm: body?.heightCm ?? null,
      weight_kg: body?.weightKg ?? null,
      activity: body?.activity ?? null,
      goal: body?.goal ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Lưu hồ sơ lỗi:", error.message);
      return { ok: false, error: "Chưa lưu được hồ sơ. Có thể mạng đang chậm, bạn thử lại sau ít phút nhé." };
    }
  } catch (err) {
    console.error("Lưu hồ sơ lỗi:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé." };
  }
  revalidatePath("/ho-so");
  return { ok: true };
}

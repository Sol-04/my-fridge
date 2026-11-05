// Đọc hồ sơ người dùng (bảng profiles) — chạy ở máy chủ.
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Activity, Gender, Goal } from "@/lib/meal-plan";

export type Profile = {
  id: string;
  display_name: string | null;
  gender: Gender | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity: Activity | null;
  goal: Goal | null;
};

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, gender, age, height_cm, weight_kg, activity, goal")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("Không đọc được hồ sơ:", error.message);
      return null;
    }
    if (!data) return null;
    return { ...data, weight_kg: data.weight_kg == null ? null : Number(data.weight_kg) } as Profile;
  } catch (err) {
    console.error("Không đọc được hồ sơ:", err instanceof Error ? err.message : err);
    return null;
  }
}

// Tên để hiển thị: tên trong hồ sơ, nếu chưa có thì lấy phần trước @ của email.
export function displayNameOf(profile: Pick<Profile, "display_name"> | null, email?: string | null): string {
  return profile?.display_name?.trim() || email?.split("@")[0] || "Bạn";
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

// Hàm lấy món ăn từ Sanity, có lưu tạm (cache) để web chạy nhanh.
// Món mới thêm trong Studio sẽ hiện ra sau tối đa khoảng 1 giờ.
import type { SanityImageSource } from "@sanity/image-url";
import { cacheLife } from "next/cache";

import { client } from "./client";
import {
  PLANNER_RECIPES_QUERY,
  RECIPE_QUERY,
  RECIPE_SLUGS_QUERY,
  RECIPES_QUERY,
} from "./queries";

export type Meal = "breakfast" | "lunch" | "dinner";
export type RecipeKind = "home" | "eatout"; // tự nấu | ăn ngoài / mua sẵn

export type RecipeCardData = {
  _id: string;
  name: string;
  slug: string;
  image?: SanityImageSource & { alt?: string; credit?: string; license?: string; sourceUrl?: string };
  calories: number;
  cookMinutes: number;
  meals: Meal[];
  kind: RecipeKind;
  servingNote?: string | null; // khẩu phần thường bán (món ăn ngoài)
};

export type RecipeDetailData = RecipeCardData & {
  description?: string;
  ingredients: { _key: string; name: string; grams: number }[];
  servingGrams: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: string[];
  healthyTip?: string | null;
  whereToBuy?: string | null;
};

// Dữ liệu món dùng cho trang tạo thực đơn
export type PlannerRecipe = Pick<
  RecipeDetailData,
  | "_id"
  | "name"
  | "slug"
  | "meals"
  | "ingredients"
  | "servingGrams"
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "kind"
  | "servingNote"
  | "healthyTip"
>;

// Nếu Sanity lỗi (ví dụ chưa đặt biến môi trường), web vẫn chạy và báo nhẹ nhàng
// thay vì bị sập.
function logError(what: string, err: unknown) {
  console.error(`Không lấy được ${what} từ Sanity:`, err instanceof Error ? err.message : err);
}

export async function getRecipes(): Promise<RecipeCardData[]> {
  "use cache";
  cacheLife("hours");
  try {
    return (await client.fetch<RecipeCardData[]>(RECIPES_QUERY)) ?? [];
  } catch (err) {
    logError("danh sách món", err);
    return [];
  }
}

export async function getRecipe(slug: string): Promise<RecipeDetailData | null> {
  "use cache";
  cacheLife("hours");
  try {
    return await client.fetch<RecipeDetailData | null>(RECIPE_QUERY, { slug });
  } catch (err) {
    logError(`món "${slug}"`, err);
    return null;
  }
}

export async function getRecipeSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  try {
    return (await client.fetch<string[]>(RECIPE_SLUGS_QUERY)) ?? [];
  } catch (err) {
    logError("danh sách slug", err);
    return [];
  }
}

export async function getPlannerRecipes(): Promise<PlannerRecipe[]> {
  "use cache";
  cacheLife("hours");
  try {
    return (await client.fetch<PlannerRecipe[]>(PLANNER_RECIPES_QUERY)) ?? [];
  } catch (err) {
    logError("dữ liệu món cho thực đơn", err);
    return [];
  }
}

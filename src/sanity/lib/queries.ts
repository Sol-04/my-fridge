// Các câu truy vấn GROQ (ngôn ngữ hỏi dữ liệu của Sanity).
import { defineQuery } from "next-sanity";

// Danh sách món cho trang /mon-an (chỉ lấy các trường cần cho thẻ món)
export const RECIPES_QUERY = defineQuery(`
  *[_type == "recipe" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    image,
    calories,
    cookMinutes,
    meals
  }
`);

// Chi tiết 1 món theo slug
export const RECIPE_QUERY = defineQuery(`
  *[_type == "recipe" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    image,
    description,
    meals,
    ingredients[] { _key, name, grams },
    servingGrams,
    calories,
    protein,
    carbs,
    fat,
    cookMinutes,
    steps
  }
`);

// Tất cả slug, để tạo sẵn trang chi tiết khi build
export const RECIPE_SLUGS_QUERY = defineQuery(`
  *[_type == "recipe" && defined(slug.current)].slug.current
`);

// Dữ liệu cho trang tạo thực đơn: nguyên liệu + dinh dưỡng của mọi món
export const PLANNER_RECIPES_QUERY = defineQuery(`
  *[_type == "recipe" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    meals,
    ingredients[] { _key, name, grams },
    servingGrams,
    calories,
    protein,
    carbs,
    fat
  }
`);

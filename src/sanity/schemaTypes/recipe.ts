import { LemonIcon } from "@sanity/icons/Lemon";
import { defineArrayMember, defineField, defineType } from "sanity";

import { MEAL_OPTIONS, mealLabel } from "../meals";

const gramField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "number",
    validation: (rule) => rule.required().min(0),
  });

// Loại nội dung "Món ăn"
export const recipe = defineType({
  name: "recipe",
  title: "Món ăn",
  type: "document",
  icon: LemonIcon,
  fields: [
    defineField({
      name: "name",
      title: "Tên món",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (đường dẫn)",
      description: "Bấm “Generate” để tạo tự động từ tên món.",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Ảnh",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Mô tả ảnh (cho người khiếm thị)",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Mô tả ngắn",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "meals",
      title: "Bữa phù hợp",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...MEAL_OPTIONS], layout: "grid" },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "ingredients",
      title: "Nguyên liệu",
      type: "array",
      of: [
        defineArrayMember({
          name: "ingredient",
          title: "Nguyên liệu",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Tên nguyên liệu",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "grams",
              title: "Số gram",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
          ],
          preview: {
            select: { title: "name", grams: "grams" },
            prepare: ({ title, grams }) => ({
              title,
              subtitle: grams != null ? `${grams} g` : undefined,
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    gramField("servingGrams", "Khối lượng 1 khẩu phần (gram)"),
    defineField({
      name: "calories",
      title: "Calo / khẩu phần (kcal)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    gramField("protein", "Chất đạm (gram)"),
    gramField("carbs", "Tinh bột (gram)"),
    gramField("fat", "Chất béo (gram)"),
    defineField({
      name: "cookMinutes",
      title: "Thời gian nấu (phút)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "steps",
      title: "Các bước chế biến",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 2 })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "name",
      calories: "calories",
      meals: "meals",
      media: "image",
    },
    prepare: ({ title, calories, meals, media }) => {
      const mealLabels = ((meals as string[] | undefined) ?? [])
        .map(mealLabel)
        .join(", ");
      return {
        title,
        subtitle: [calories != null ? `${calories} kcal` : null, mealLabels]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});

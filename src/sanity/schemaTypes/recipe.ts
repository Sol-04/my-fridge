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

// Món "ăn ngoài / mua sẵn" không cần nguyên liệu, thời gian nấu, các bước.
// Món cũ chưa có `kind` được coi là "Tự nấu".
type Ctx = { document?: unknown };
const isEatOut = ({ document }: Ctx) => (document as { kind?: string } | undefined)?.kind === "eatout";
const requiredForHome = (message: string) => (value: unknown, ctx: Ctx) => {
  if (isEatOut(ctx)) return true;
  const empty = value == null || (Array.isArray(value) && value.length === 0);
  return empty ? message : true;
};

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
      name: "kind",
      title: "Loại món",
      type: "string",
      options: {
        list: [
          { title: "Tự nấu (có công thức)", value: "home" },
          { title: "Ăn ngoài / mua sẵn (không có công thức)", value: "eatout" },
        ],
        layout: "radio",
      },
      initialValue: "home",
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
        defineField({
          name: "credit",
          title: "Tác giả ảnh",
          description: "Bắt buộc ghi khi dùng ảnh có giấy phép CC BY / CC BY-SA. Ảnh tự chụp: ghi tên bạn.",
          type: "string",
        }),
        defineField({
          name: "license",
          title: "Giấy phép ảnh",
          description: "Ví dụ: CC BY-SA 4.0, CC0, Ảnh tự chụp",
          type: "string",
        }),
        defineField({
          name: "sourceUrl",
          title: "Link trang gốc của ảnh",
          type: "url",
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
      name: "servingNote",
      title: "Khẩu phần thường bán",
      description: "Ví dụ: 1 tô vừa (~550 g)",
      type: "string",
      hidden: ({ document }) => document?.kind !== "eatout",
      validation: (rule) =>
        rule.custom((v, ctx) => (!isEatOut(ctx) || v ? true : "Món ăn ngoài cần ghi khẩu phần thường bán")),
    }),
    defineField({
      name: "healthyTip",
      title: "Mẹo gọi món lành mạnh hơn",
      description: "Ví dụ: Xin ít bánh, thêm rau, không uống hết nước béo",
      type: "text",
      rows: 2,
      hidden: ({ document }) => document?.kind !== "eatout",
    }),
    defineField({
      name: "whereToBuy",
      title: "Thường bán ở",
      description: "Ví dụ: Quán phở, cửa hàng tiện lợi",
      type: "string",
      hidden: ({ document }) => document?.kind !== "eatout",
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
      hidden: ({ document }) => document?.kind === "eatout",
      validation: (rule) => rule.custom(requiredForHome("Món tự nấu cần ít nhất 1 nguyên liệu")),
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
      hidden: ({ document }) => document?.kind === "eatout",
      validation: (rule) => rule.min(0).custom(requiredForHome("Món tự nấu cần thời gian nấu")),
    }),
    defineField({
      name: "steps",
      title: "Các bước chế biến",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 2 })],
      hidden: ({ document }) => document?.kind === "eatout",
      validation: (rule) => rule.custom(requiredForHome("Món tự nấu cần ít nhất 1 bước")),
    }),
  ],
  preview: {
    select: {
      title: "name",
      calories: "calories",
      meals: "meals",
      kind: "kind",
      media: "image",
    },
    prepare: ({ title, calories, meals, kind, media }) => {
      const mealLabels = ((meals as string[] | undefined) ?? [])
        .map(mealLabel)
        .join(", ");
      return {
        title,
        subtitle: [kind === "eatout" ? "Ăn ngoài" : null, calories != null ? `${calories} kcal` : null, mealLabels]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});

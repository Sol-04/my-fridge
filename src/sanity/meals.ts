// Các bữa trong ngày. "value" là mã lưu trong dữ liệu, "title" là chữ hiển thị.
// File này nhỏ, dùng chung cho Studio và trang web.
export const MEAL_OPTIONS = [
  { title: "Bữa sáng", value: "breakfast" },
  { title: "Bữa trưa", value: "lunch" },
  { title: "Bữa tối", value: "dinner" },
  { title: "Bữa phụ", value: "snack" },
] as const;

export function mealLabel(value: string): string {
  return MEAL_OPTIONS.find((o) => o.value === value)?.title ?? value;
}

// Bảng dinh dưỡng ƯỚC TÍNH trên 100 g nguyên liệu (dạng sống, trừ khi ghi "cơm"/"luộc").
// Nguồn tham khảo: bảng thành phần thực phẩm Việt Nam & USDA, làm tròn.
// Đây là tên nguyên liệu CHUẨN — mọi món phải dùng đúng các tên này.
export type Nutrition = {
  kcal: number;
  protein: number; // gram đạm
  carbs: number; // gram tinh bột
  fat: number; // gram chất béo
};

export const NUTRITION = {
  // Đạm
  "Trứng gà": { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
  "Ức gà": { kcal: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  "Thịt heo nạc": { kcal: 143, protein: 21, carbs: 0, fat: 6 },
  "Thịt bò nạc": { kcal: 130, protein: 21.5, carbs: 0, fat: 4.5 },
  "Cá basa": { kcal: 100, protein: 15, carbs: 0, fat: 4.5 },
  "Cá rô phi": { kcal: 96, protein: 20, carbs: 0, fat: 1.7 },
  "Tôm": { kcal: 85, protein: 20, carbs: 0, fat: 0.5 },
  "Đậu phụ": { kcal: 95, protein: 10.9, carbs: 0.7, fat: 5.4 },
  // Sữa
  "Sữa tươi không đường": { kcal: 62, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "Sữa đậu nành không đường": { kcal: 33, protein: 2.9, carbs: 1.8, fat: 1.6 },
  "Sữa chua không đường": { kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  // Tinh bột
  "Yến mạch": { kcal: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  "Cơm gạo lứt": { kcal: 112, protein: 2.6, carbs: 23.5, fat: 0.9 },
  "Bún tươi": { kcal: 110, protein: 1.7, carbs: 25.7, fat: 0.1 },
  "Bánh phở tươi": { kcal: 141, protein: 3.2, carbs: 32, fat: 0.4 },
  "Bánh mì nguyên cám": { kcal: 250, protein: 12, carbs: 43, fat: 3.5 },
  "Khoai lang": { kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  // Rau củ
  "Bí đỏ": { kcal: 26, protein: 1, carbs: 6.5, fat: 0.1 },
  "Cải ngọt": { kcal: 15, protein: 1.7, carbs: 2.2, fat: 0.2 },
  "Cải thìa": { kcal: 13, protein: 1.5, carbs: 2.2, fat: 0.2 },
  "Rau muống": { kcal: 19, protein: 2.6, carbs: 3.1, fat: 0.2 },
  "Mồng tơi": { kcal: 19, protein: 1.8, carbs: 3.4, fat: 0.3 },
  "Xà lách": { kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  "Bông cải xanh": { kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
  "Cà chua": { kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  "Dưa leo": { kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  "Cà rốt": { kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  "Đậu bắp": { kcal: 33, protein: 1.9, carbs: 7.5, fat: 0.2 },
  "Nấm rơm": { kcal: 31, protein: 3.6, carbs: 3.3, fat: 0.3 },
  "Giá đỗ": { kcal: 31, protein: 3, carbs: 6, fat: 0.2 },
  // Trái cây
  "Chuối": { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  // Gia vị
  "Hành lá": { kcal: 32, protein: 1.8, carbs: 7.3, fat: 0.2 },
  "Hành tím": { kcal: 72, protein: 2.5, carbs: 16.8, fat: 0.1 },
  "Tỏi": { kcal: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  "Gừng": { kcal: 80, protein: 1.8, carbs: 17.8, fat: 0.8 },
  "Nước cốt chanh": { kcal: 22, protein: 0.4, carbs: 7, fat: 0.2 },
  "Nước mắm": { kcal: 35, protein: 5, carbs: 3.6, fat: 0 },
  "Dầu ăn": { kcal: 884, protein: 0, carbs: 0, fat: 100 },
  // Hạt
  "Đậu phộng": { kcal: 567, protein: 25.8, carbs: 16, fat: 49 },
  "Mè": { kcal: 573, protein: 17.7, carbs: 23.4, fat: 49.7 },
} satisfies Record<string, Nutrition>;

export type IngredientName = keyof typeof NUTRITION;

// Món ĂN NGOÀI / MUA SẴN — không có công thức, chỉ có dinh dưỡng ƯỚC TÍNH cho 1 phần thường bán.
// Số liệu tham khảo từ bảng thành phần thực phẩm Việt Nam và các nguồn dinh dưỡng phổ biến, làm tròn;
// thực tế thay đổi tuỳ quán. Kiểm tra: calo ≈ đạm×4 + tinh bột×4 + béo×9.
type Meal = "breakfast" | "lunch" | "dinner";

export type EatOutInput = {
  slug: string;
  name: string;
  description: string;
  meals: Meal[];
  servingNote: string; // khẩu phần thường bán
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthyTip: string; // mẹo gọi món lành mạnh hơn
  whereToBuy: string;
};

export const EATOUT: EatOutInput[] = [
  // ---------- Món nước, sáng ----------
  { slug: "pho-bo-tai", name: "Phở bò tái", meals: ["breakfast", "lunch"], description: "Tô phở bò tái nước trong, thơm quế hồi.", servingNote: "1 tô vừa (~550 g)", servingGrams: 550, calories: 450, protein: 25, carbs: 60, fat: 11, healthyTip: "Xin ít bánh, thêm rau thơm và giá; không uống hết nước dùng béo.", whereToBuy: "Quán phở" },
  { slug: "pho-ga", name: "Phở gà", meals: ["breakfast", "lunch"], description: "Phở gà xé, nước dùng thanh ngọt.", servingNote: "1 tô vừa (~550 g)", servingGrams: 550, calories: 420, protein: 26, carbs: 58, fat: 8, healthyTip: "Chọn thịt ức, bỏ da gà; xin thêm hành và rau thơm.", whereToBuy: "Quán phở" },
  { slug: "bun-bo-hue", name: "Bún bò Huế", meals: ["breakfast", "lunch"], description: "Bún bò cay nồng mùi sả, có bò bắp và chả.", servingNote: "1 tô vừa (~600 g)", servingGrams: 600, calories: 550, protein: 28, carbs: 62, fat: 20, healthyTip: "Bỏ bớt chả và giò heo, hớt bớt lớp dầu điều; ăn nhiều rau sống.", whereToBuy: "Quán bún bò" },
  { slug: "bun-rieu-cua", name: "Bún riêu cua", meals: ["breakfast", "lunch"], description: "Bún riêu cua đồng chua dịu với cà chua và đậu phụ.", servingNote: "1 tô vừa (~550 g)", servingGrams: 550, calories: 480, protein: 22, carbs: 60, fat: 16, healthyTip: "Bớt đậu phụ chiên và mỡ hành; thêm rau muống, bắp chuối.", whereToBuy: "Quán bún, gánh hàng rong" },
  { slug: "hu-tieu-nam-vang", name: "Hủ tiếu Nam Vang", meals: ["breakfast", "lunch"], description: "Hủ tiếu nước với tôm, thịt bằm, gan.", servingNote: "1 tô vừa (~550 g)", servingGrams: 550, calories: 500, protein: 26, carbs: 64, fat: 14, healthyTip: "Xin ít hủ tiếu, bỏ tóp mỡ và hành phi; thêm hẹ, giá.", whereToBuy: "Quán hủ tiếu" },
  { slug: "mi-quang", name: "Mì Quảng", meals: ["breakfast", "lunch"], description: "Mì Quảng tôm thịt, nước dùng ít, rắc đậu phộng.", servingNote: "1 tô (~450 g)", servingGrams: 450, calories: 550, protein: 27, carbs: 66, fat: 18, healthyTip: "Bớt bánh tráng mè và đậu phộng; ăn nhiều rau sống.", whereToBuy: "Quán mì Quảng" },
  { slug: "chao-ga", name: "Cháo gà", meals: ["breakfast", "dinner"], description: "Cháo gà nấu nhừ, ăn kèm hành và tiêu.", servingNote: "1 bát lớn (~450 g)", servingGrams: 450, calories: 330, protein: 20, carbs: 45, fat: 7, healthyTip: "Chọn thịt ức, bỏ quẩy chiên ăn kèm.", whereToBuy: "Quán cháo" },
  { slug: "chao-suon", name: "Cháo sườn", meals: ["breakfast", "dinner"], description: "Cháo sườn sụn mịn, rắc ruốc và hành phi.", servingNote: "1 bát (~450 g)", servingGrams: 450, calories: 380, protein: 18, carbs: 50, fat: 12, healthyTip: "Không thêm quẩy; xin ít ruốc và hành phi.", whereToBuy: "Quán cháo, xe đẩy" },
  // ---------- Bánh, xôi, sáng ----------
  { slug: "banh-mi-thit", name: "Bánh mì thịt", meals: ["breakfast"], description: "Bánh mì kẹp thịt nguội, pa-tê, dưa góp.", servingNote: "1 ổ (~200 g)", servingGrams: 200, calories: 450, protein: 18, carbs: 52, fat: 18, healthyTip: "Xin ít pa-tê và bơ; thêm dưa leo, rau thơm.", whereToBuy: "Xe bánh mì, tiệm bánh mì" },
  { slug: "banh-mi-op-la", name: "Bánh mì ốp la", meals: ["breakfast"], description: "Hai trứng ốp la ăn kèm bánh mì và dưa leo.", servingNote: "1 phần (~220 g)", servingGrams: 220, calories: 420, protein: 17, carbs: 48, fat: 17, healthyTip: "Xin trứng ít dầu, thêm dưa leo cà chua; bỏ xúc xích.", whereToBuy: "Quán điểm tâm" },
  { slug: "xoi-xeo", name: "Xôi xéo", meals: ["breakfast"], description: "Xôi vàng đậu xanh, hành phi, ăn no lâu.", servingNote: "1 gói (~250 g)", servingGrams: 250, calories: 520, protein: 12, carbs: 82, fat: 16, healthyTip: "Mua nửa phần, xin ít mỡ hành.", whereToBuy: "Hàng xôi" },
  { slug: "xoi-ga", name: "Xôi gà", meals: ["breakfast"], description: "Xôi trắng với gà xé, hành phi.", servingNote: "1 hộp (~280 g)", servingGrams: 280, calories: 550, protein: 24, carbs: 80, fat: 14, healthyTip: "Xin ít xôi, nhiều gà; bỏ da gà và mỡ hành.", whereToBuy: "Hàng xôi" },
  { slug: "banh-cuon", name: "Bánh cuốn", meals: ["breakfast"], description: "Bánh cuốn nhân thịt mộc nhĩ, ăn kèm chả và nước mắm.", servingNote: "1 đĩa (~350 g)", servingGrams: 350, calories: 400, protein: 15, carbs: 65, fat: 9, healthyTip: "Ăn kèm nhiều rau, bớt hành phi; chấm ít nước mắm.", whereToBuy: "Quán bánh cuốn" },
  { slug: "banh-bao-nhan-thit", name: "Bánh bao nhân thịt", meals: ["breakfast"], description: "Bánh bao nhân thịt trứng cút, tiện mang đi.", servingNote: "1 cái (~160 g)", servingGrams: 160, calories: 330, protein: 12, carbs: 45, fat: 11, healthyTip: "Ăn kèm 1 hộp sữa không đường hoặc trái cây cho đủ chất.", whereToBuy: "Tiệm bánh, xe đẩy" },
  // ---------- Cơm, bún, trưa / tối ----------
  { slug: "com-tam-suon", name: "Cơm tấm sườn", meals: ["lunch", "dinner"], description: "Cơm tấm sườn nướng, mỡ hành, đồ chua.", servingNote: "1 đĩa (~400 g)", servingGrams: 400, calories: 700, protein: 35, carbs: 85, fat: 24, healthyTip: "Xin ít cơm, bỏ bì và mỡ hành; thêm dưa leo, cà chua.", whereToBuy: "Quán cơm tấm" },
  { slug: "com-ga-hai-nam", name: "Cơm gà Hải Nam", meals: ["lunch", "dinner"], description: "Cơm nấu nước gà, gà luộc, nước chấm gừng.", servingNote: "1 đĩa (~400 g)", servingGrams: 400, calories: 650, protein: 34, carbs: 78, fat: 21, healthyTip: "Chọn phần ức, bỏ da; xin ít cơm.", whereToBuy: "Quán cơm gà" },
  { slug: "com-van-phong", name: "Cơm văn phòng (1 mặn, rau, canh)", meals: ["lunch", "dinner"], description: "Suất cơm bình dân: cơm trắng, một món mặn, rau xào và bát canh.", servingNote: "1 suất (~450 g)", servingGrams: 450, calories: 620, protein: 30, carbs: 80, fat: 18, healthyTip: "Chọn món luộc, hấp, kho nhạt; rau luộc thay rau xào; xin ít cơm.", whereToBuy: "Quán cơm bình dân" },
  { slug: "com-rang-dua-bo", name: "Cơm rang dưa bò", meals: ["lunch"], description: "Cơm rang với dưa cải và thịt bò.", servingNote: "1 đĩa (~400 g)", servingGrams: 400, calories: 750, protein: 28, carbs: 90, fat: 30, healthyTip: "Món nhiều dầu: ăn nửa phần, gọi thêm canh rau.", whereToBuy: "Quán cơm rang" },
  { slug: "com-chay", name: "Cơm chay", meals: ["lunch", "dinner"], description: "Suất cơm chay với đậu phụ, nấm, rau.", servingNote: "1 suất (~400 g)", servingGrams: 400, calories: 550, protein: 16, carbs: 82, fat: 17, healthyTip: "Chọn đậu phụ, nấm, rau luộc; tránh món chay chiên giòn.", whereToBuy: "Quán chay" },
  { slug: "bun-cha-ha-noi", name: "Bún chả Hà Nội", meals: ["lunch"], description: "Chả nướng than hoa, bún, rau sống, nước chấm chua ngọt.", servingNote: "1 suất (~500 g)", servingGrams: 500, calories: 600, protein: 28, carbs: 70, fat: 22, healthyTip: "Ăn nhiều rau sống, ít bún; chọn chả miếng nạc, bỏ nem rán.", whereToBuy: "Quán bún chả" },
  { slug: "bun-thit-nuong", name: "Bún thịt nướng", meals: ["lunch", "dinner"], description: "Bún trộn thịt nướng, rau sống, đậu phộng, mỡ hành.", servingNote: "1 tô (~450 g)", servingGrams: 450, calories: 550, protein: 26, carbs: 68, fat: 18, healthyTip: "Bỏ chả giò và mỡ hành; xin thêm rau.", whereToBuy: "Quán bún" },
  { slug: "bun-ca", name: "Bún cá", meals: ["lunch", "dinner"], description: "Bún cá chiên hoặc cá rô, nước dùng chua thanh.", servingNote: "1 tô (~500 g)", servingGrams: 500, calories: 450, protein: 26, carbs: 60, fat: 10, healthyTip: "Chọn cá luộc thay cá chiên; thêm rau cần, cải.", whereToBuy: "Quán bún cá" },
  { slug: "mien-ga", name: "Miến gà", meals: ["lunch", "dinner"], description: "Miến dong nấu nước gà, thịt gà xé, hành mùi.", servingNote: "1 tô (~500 g)", servingGrams: 500, calories: 400, protein: 24, carbs: 55, fat: 9, healthyTip: "Chọn thịt ức, bỏ da và lòng gà.", whereToBuy: "Quán miến, phở" },
  { slug: "banh-canh-cua", name: "Bánh canh cua", meals: ["lunch", "dinner"], description: "Bánh canh sợi bột lọc, nước dùng cua sánh.", servingNote: "1 tô (~550 g)", servingGrams: 550, calories: 500, protein: 22, carbs: 66, fat: 15, healthyTip: "Xin ít sợi bánh, bỏ chả và giò heo.", whereToBuy: "Quán bánh canh" },
  { slug: "bo-kho-banh-mi", name: "Bò kho bánh mì", meals: ["lunch", "dinner"], description: "Bò kho sả quế mềm, chấm bánh mì.", servingNote: "1 tô + 1 ổ nhỏ (~450 g)", servingGrams: 450, calories: 620, protein: 30, carbs: 62, fat: 26, healthyTip: "Hớt bớt lớp dầu trên mặt; ăn nửa ổ bánh mì, thêm rau quế.", whereToBuy: "Quán bò kho" },
  { slug: "banh-xeo", name: "Bánh xèo", meals: ["lunch", "dinner"], description: "Bánh xèo tôm thịt giá, cuốn rau sống.", servingNote: "2 cái + rau (~300 g)", servingGrams: 300, calories: 560, protein: 18, carbs: 55, fat: 30, healthyTip: "Thấm bớt dầu, cuốn thật nhiều rau; ăn 1 cái nếu đang giảm cân.", whereToBuy: "Quán bánh xèo" },
  { slug: "goi-cuon-tom-thit", name: "Gỏi cuốn tôm thịt", meals: ["lunch", "dinner"], description: "Bánh tráng cuốn tôm, thịt luộc, bún, rau sống.", servingNote: "3 cuốn (~300 g)", servingGrams: 300, calories: 300, protein: 18, carbs: 45, fat: 5, healthyTip: "Chấm nước mắm chua ngọt thay tương đậu phộng để bớt béo.", whereToBuy: "Quán ăn vặt, chợ" },
  { slug: "pho-cuon", name: "Phở cuốn", meals: ["lunch", "dinner"], description: "Bánh phở cuốn thịt bò xào và rau thơm.", servingNote: "5 cuốn (~250 g)", servingGrams: 250, calories: 380, protein: 20, carbs: 50, fat: 10, healthyTip: "Chấm ít nước chấm, ăn kèm thêm rau.", whereToBuy: "Quán phở cuốn" },
  // ---------- Mua sẵn ở cửa hàng tiện lợi ----------
  { slug: "com-nam-ca-ngu", name: "Cơm nắm cá ngừ", meals: ["breakfast", "lunch"], description: "Cơm nắm tam giác nhân cá ngừ mayonnaise.", servingNote: "1 cái (~120 g)", servingGrams: 120, calories: 200, protein: 6, carbs: 38, fat: 3, healthyTip: "Ăn kèm salad hoặc hộp sữa chua không đường cho đủ no.", whereToBuy: "Cửa hàng tiện lợi" },
  { slug: "salad-uc-ga", name: "Salad ức gà", meals: ["lunch", "dinner"], description: "Hộp salad rau xanh với ức gà, trứng, ngô.", servingNote: "1 hộp (~300 g)", servingGrams: 300, calories: 320, protein: 28, carbs: 15, fat: 16, healthyTip: "Dùng nửa gói sốt; chọn sốt mè rang hoặc dầu giấm.", whereToBuy: "Cửa hàng tiện lợi, siêu thị" },
  { slug: "sandwich-trung", name: "Sandwich trứng", meals: ["breakfast"], description: "Bánh mì sandwich kẹp trứng và rau.", servingNote: "1 hộp (~150 g)", servingGrams: 150, calories: 360, protein: 14, carbs: 38, fat: 17, healthyTip: "Chọn loại bánh mì nguyên cám nếu có; ăn kèm trái cây.", whereToBuy: "Cửa hàng tiện lợi" },
  { slug: "sua-chua-chuoi", name: "Sữa chua không đường và chuối", meals: ["breakfast"], description: "Bữa sáng siêu nhanh: 1 hộp sữa chua không đường và 1 quả chuối.", servingNote: "1 hộp sữa chua + 1 quả chuối (~300 g)", servingGrams: 300, calories: 190, protein: 5, carbs: 33, fat: 4, healthyTip: "Thêm một nắm hạt hoặc 1 quả trứng luộc nếu cần no lâu hơn.", whereToBuy: "Cửa hàng tiện lợi, siêu thị" },
];

export function buildEatOutDocument(e: EatOutInput) {
  return {
    _id: `recipe-${e.slug}`,
    _type: "recipe",
    kind: "eatout",
    name: e.name,
    slug: { _type: "slug", current: e.slug },
    description: e.description,
    meals: e.meals,
    servingNote: e.servingNote,
    servingGrams: e.servingGrams,
    calories: e.calories,
    protein: e.protein,
    carbs: e.carbs,
    fat: e.fat,
    healthyTip: e.healthyTip,
    whereToBuy: e.whereToBuy,
  };
}

export const EATOUT_DOCUMENTS = EATOUT.map(buildEatOutDocument);

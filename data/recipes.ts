// Món ăn Việt lành mạnh, dễ nấu (TỰ NẤU): 24 món gốc ở file này + 36 món ở data/recipes-more.ts.
// Calo / đạm / tinh bột / béo được TÍNH TỰ ĐỘNG từ số gram (xem buildRecipeDocument bên dưới).
import { NUTRITION, type IngredientName } from "./nutrition";
import { MORE_RECIPES } from "./recipes-more";

type Meal = "breakfast" | "lunch" | "dinner";

export type RecipeInput = {
  slug: string;
  name: string;
  description: string;
  meals: Meal[];
  cookMinutes: number;
  ingredients: [IngredientName, number][]; // [tên nguyên liệu chuẩn, số gram]
  steps: string[];
};

export const RECIPES: RecipeInput[] = [
  // ===================== BỮA SÁNG =====================
  {
    slug: "yen-mach-nau-sua-chuoi",
    name: "Yến mạch nấu sữa chuối",
    description: "Bát yến mạch mềm thơm sữa, ngọt tự nhiên từ chuối, no lâu cho buổi sáng.",
    meals: ["breakfast"],
    cookMinutes: 10,
    ingredients: [
      ["Yến mạch", 50],
      ["Sữa tươi không đường", 200],
      ["Chuối", 100],
    ],
    steps: [
      "Cho yến mạch và sữa vào nồi nhỏ, đun lửa vừa, khuấy đều 4–5 phút đến khi sánh.",
      "Chuối bóc vỏ, cắt lát mỏng.",
      "Múc yến mạch ra bát, xếp chuối lên trên, ăn nóng.",
    ],
  },
  {
    slug: "trung-op-la-banh-mi-nguyen-cam",
    name: "Trứng ốp la bánh mì nguyên cám",
    description: "Hai quả trứng ốp la ăn kèm bánh mì nguyên cám, dưa leo và cà chua tươi.",
    meals: ["breakfast"],
    cookMinutes: 10,
    ingredients: [
      ["Trứng gà", 100],
      ["Bánh mì nguyên cám", 70],
      ["Dưa leo", 80],
      ["Cà chua", 80],
      ["Dầu ăn", 5],
    ],
    steps: [
      "Làm nóng chảo với dầu ăn, đập 2 quả trứng vào, chiên lửa nhỏ đến khi lòng trắng chín.",
      "Nướng sơ bánh mì cho giòn (nếu thích).",
      "Dưa leo, cà chua rửa sạch, cắt lát. Bày cùng trứng và bánh mì.",
    ],
  },
  {
    slug: "khoai-lang-luoc-trung-luoc",
    name: "Khoai lang luộc, trứng luộc, sữa đậu nành",
    description: "Bữa sáng đơn giản giàu chất xơ và đạm, chuẩn bị nhanh từ tối hôm trước.",
    meals: ["breakfast"],
    cookMinutes: 25,
    ingredients: [
      ["Khoai lang", 200],
      ["Trứng gà", 100],
      ["Sữa đậu nành không đường", 200],
    ],
    steps: [
      "Khoai lang rửa sạch, luộc hoặc hấp 20–25 phút đến khi xiên đũa thấy mềm.",
      "Trứng cho vào nồi nước lạnh, đun sôi rồi luộc thêm 8 phút, ngâm nước lạnh và bóc vỏ.",
      "Ăn kèm một ly sữa đậu nành không đường.",
    ],
  },
  {
    slug: "chao-yen-mach-uc-ga",
    name: "Cháo yến mạch ức gà",
    description: "Cháo yến mạch nấu nhanh với ức gà, trứng và cà rốt, ấm bụng mà ít calo.",
    meals: ["breakfast"],
    cookMinutes: 20,
    ingredients: [
      ["Yến mạch", 40],
      ["Ức gà", 80],
      ["Trứng gà", 50],
      ["Cà rốt", 50],
      ["Hành lá", 10],
      ["Gừng", 5],
      ["Nước mắm", 5],
    ],
    steps: [
      "Ức gà luộc chín với vài lát gừng (khoảng 12 phút), vớt ra xé nhỏ, giữ lại nước luộc.",
      "Cà rốt thái hạt lựu, cho vào nước luộc gà đun 5 phút.",
      "Thêm yến mạch, khuấy đều 3–4 phút đến khi sánh.",
      "Đập trứng vào, khuấy nhẹ, nêm nước mắm. Cho thịt gà và hành lá lên trên.",
    ],
  },
  {
    slug: "banh-mi-kep-uc-ga-xe",
    name: "Bánh mì nguyên cám kẹp ức gà xé",
    description: "Bánh mì kẹp ức gà xé, rau tươi, kèm hũ sữa chua không đường.",
    meals: ["breakfast"],
    cookMinutes: 15,
    ingredients: [
      ["Bánh mì nguyên cám", 80],
      ["Ức gà", 80],
      ["Dưa leo", 50],
      ["Cà chua", 50],
      ["Xà lách", 30],
      ["Sữa chua không đường", 100],
    ],
    steps: [
      "Luộc ức gà khoảng 12 phút đến khi chín, để nguội rồi xé nhỏ (có thể luộc sẵn từ tối).",
      "Rửa sạch xà lách, dưa leo, cà chua; thái lát.",
      "Xẻ bánh mì, kẹp rau và thịt gà vào. Ăn kèm sữa chua.",
    ],
  },
  {
    slug: "pho-ga-it-banh",
    name: "Phở gà ít bánh",
    description: "Tô phở gà thanh nhẹ, giảm bánh phở, tăng thịt gà và giá đỗ.",
    meals: ["breakfast"],
    cookMinutes: 30,
    ingredients: [
      ["Bánh phở tươi", 150],
      ["Ức gà", 80],
      ["Giá đỗ", 50],
      ["Hành lá", 10],
      ["Gừng", 5],
      ["Nước mắm", 10],
    ],
    steps: [
      "Luộc ức gà với gừng nướng khoảng 15 phút, vớt ra thái lát; lọc lấy nước dùng.",
      "Nêm nước dùng với nước mắm cho vừa ăn.",
      "Trụng bánh phở và giá đỗ qua nước sôi, cho vào tô.",
      "Xếp thịt gà, hành lá lên trên, chan nước dùng nóng.",
    ],
  },
  {
    slug: "trung-cuon-rau-cu-khoai-lang",
    name: "Trứng cuộn rau củ và khoai lang hấp",
    description: "Trứng cuộn cà rốt, hành lá mềm mịn, ăn kèm khoai lang hấp.",
    meals: ["breakfast"],
    cookMinutes: 25,
    ingredients: [
      ["Trứng gà", 100],
      ["Cà rốt", 30],
      ["Hành lá", 10],
      ["Dầu ăn", 5],
      ["Khoai lang", 150],
    ],
    steps: [
      "Khoai lang hấp 20 phút đến khi chín mềm.",
      "Cà rốt bào sợi nhỏ, hành lá thái nhỏ, trộn đều với trứng đã đánh tan.",
      "Tráng chảo với dầu, đổ trứng thành lớp mỏng, khi mặt trứng hơi se thì cuộn lại.",
      "Cắt khúc vừa ăn, dùng cùng khoai lang.",
    ],
  },
  {
    slug: "sua-chua-yen-mach-chuoi-dau-phong",
    name: "Sữa chua yến mạch chuối đậu phộng",
    description: "Không cần nấu: sữa chua trộn yến mạch, chuối và đậu phộng rang.",
    meals: ["breakfast"],
    cookMinutes: 5,
    ingredients: [
      ["Sữa chua không đường", 150],
      ["Yến mạch", 30],
      ["Chuối", 80],
      ["Đậu phộng", 10],
    ],
    steps: [
      "Cho sữa chua vào bát, rắc yến mạch lên (có thể ngâm từ tối để yến mạch mềm).",
      "Chuối cắt lát, đậu phộng rang giã dập.",
      "Xếp chuối và đậu phộng lên trên, ăn ngay.",
    ],
  },

  // ===================== BỮA TRƯA =====================
  {
    slug: "com-gao-lut-uc-ga-ap-chao-bong-cai",
    name: "Cơm gạo lứt ức gà áp chảo, bông cải luộc",
    description: "Ức gà áp chảo tỏi thơm, bông cải xanh luộc và cơm gạo lứt — suất ăn giàu đạm.",
    meals: ["lunch"],
    cookMinutes: 25,
    ingredients: [
      ["Cơm gạo lứt", 180],
      ["Ức gà", 150],
      ["Bông cải xanh", 150],
      ["Tỏi", 5],
      ["Dầu ăn", 5],
      ["Nước mắm", 5],
    ],
    steps: [
      "Ức gà lọc mỏng, ướp tỏi băm và nước mắm 10 phút.",
      "Làm nóng chảo với dầu, áp chảo ức gà mỗi mặt 4–5 phút đến khi chín vàng.",
      "Bông cải xanh cắt nhỏ, luộc 3 phút.",
      "Thái gà thành lát, ăn cùng bông cải và cơm gạo lứt.",
    ],
  },
  {
    slug: "com-gao-lut-thit-heo-rim-rau-muong",
    name: "Cơm gạo lứt thịt heo nạc rim, rau muống luộc",
    description: "Thịt heo nạc rim mặn ngọt đậm đà, rau muống luộc chấm nước mắm.",
    meals: ["lunch"],
    cookMinutes: 30,
    ingredients: [
      ["Cơm gạo lứt", 180],
      ["Thịt heo nạc", 120],
      ["Rau muống", 200],
      ["Hành tím", 10],
      ["Nước mắm", 10],
      ["Dầu ăn", 5],
    ],
    steps: [
      "Thịt heo thái miếng vừa, ướp hành tím băm và nước mắm 15 phút.",
      "Phi thơm phần hành còn lại với dầu, cho thịt vào đảo săn, thêm chút nước, rim lửa nhỏ 15 phút.",
      "Rau muống nhặt sạch, luộc chín.",
      "Ăn thịt rim với rau muống và cơm gạo lứt.",
    ],
  },
  {
    slug: "bun-ca-ro-phi",
    name: "Bún cá rô phi",
    description: "Bún nước cá rô phi với cà chua, chua nhẹ, thanh mát buổi trưa.",
    meals: ["lunch"],
    cookMinutes: 30,
    ingredients: [
      ["Bún tươi", 200],
      ["Cá rô phi", 120],
      ["Cà chua", 100],
      ["Hành lá", 10],
      ["Dầu ăn", 5],
      ["Nước mắm", 10],
    ],
    steps: [
      "Cá rô phi phi lê, cắt miếng, ướp chút nước mắm.",
      "Áp chảo cá với dầu cho săn, gắp ra.",
      "Cà chua bổ múi, xào sơ, thêm 500 ml nước, đun sôi rồi cho cá vào nấu 5 phút, nêm nước mắm.",
      "Cho bún vào tô, xếp cá, chan nước dùng, rắc hành lá.",
    ],
  },
  {
    slug: "com-gao-lut-dau-phu-sot-ca-chua",
    name: "Cơm gạo lứt đậu phụ sốt cà chua, canh cải ngọt",
    description: "Đậu phụ sốt cà chua quen thuộc, canh cải ngọt, phù hợp cả người ăn chay.",
    meals: ["lunch"],
    cookMinutes: 25,
    ingredients: [
      ["Cơm gạo lứt", 180],
      ["Đậu phụ", 200],
      ["Cà chua", 150],
      ["Hành lá", 10],
      ["Dầu ăn", 7],
      ["Cải ngọt", 150],
      ["Nước mắm", 10],
    ],
    steps: [
      "Đậu phụ cắt miếng vuông, áp chảo với dầu đến khi vàng nhẹ.",
      "Cà chua thái nhỏ, xào nhuyễn, nêm nước mắm, cho đậu vào rim 5 phút, rắc hành lá.",
      "Cải ngọt cắt khúc, nấu canh với 400 ml nước sôi khoảng 3 phút.",
      "Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "ca-basa-kho-tieu-com-gao-lut",
    name: "Cá basa kho tiêu, cơm gạo lứt",
    description: "Cá basa kho tiêu thơm cay, ăn kèm dưa leo cho đỡ ngấy.",
    meals: ["lunch"],
    cookMinutes: 30,
    ingredients: [
      ["Cơm gạo lứt", 180],
      ["Cá basa", 150],
      ["Hành tím", 10],
      ["Nước mắm", 15],
      ["Dầu ăn", 5],
      ["Dưa leo", 100],
    ],
    steps: [
      "Cá basa cắt khúc, ướp hành tím băm, nước mắm và tiêu 15 phút.",
      "Phi thơm hành với dầu, xếp cá vào nồi, thêm chút nước.",
      "Kho lửa nhỏ 15 phút đến khi nước sệt lại.",
      "Ăn với cơm gạo lứt và dưa leo thái lát.",
    ],
  },
  {
    slug: "ga-xao-nam-com-gao-lut",
    name: "Ức gà xào nấm rơm, cơm gạo lứt",
    description: "Ức gà xào nấm rơm tỏi, mềm ngọt, nấu nhanh trong 20 phút.",
    meals: ["lunch"],
    cookMinutes: 20,
    ingredients: [
      ["Cơm gạo lứt", 150],
      ["Ức gà", 130],
      ["Nấm rơm", 100],
      ["Tỏi", 5],
      ["Dầu ăn", 7],
      ["Nước mắm", 5],
    ],
    steps: [
      "Ức gà thái lát mỏng, ướp nước mắm. Nấm rơm rửa sạch, bổ đôi.",
      "Phi tỏi với dầu, cho gà vào xào săn.",
      "Thêm nấm, đảo đều 3–4 phút đến khi chín.",
      "Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "bo-xao-bong-cai-com-gao-lut",
    name: "Bò xào bông cải, cơm gạo lứt",
    description: "Thịt bò nạc xào bông cải xanh và cà rốt, giàu sắt và chất xơ.",
    meals: ["lunch"],
    cookMinutes: 20,
    ingredients: [
      ["Cơm gạo lứt", 150],
      ["Thịt bò nạc", 120],
      ["Bông cải xanh", 150],
      ["Cà rốt", 50],
      ["Tỏi", 5],
      ["Dầu ăn", 7],
      ["Nước mắm", 5],
    ],
    steps: [
      "Thịt bò thái mỏng ngang thớ, ướp tỏi băm và nước mắm.",
      "Bông cải cắt nhỏ, cà rốt thái lát; chần sơ qua nước sôi.",
      "Xào bò lửa lớn với dầu 1–2 phút cho tái, gắp ra.",
      "Xào rau củ 2 phút, cho bò vào đảo đều rồi tắt bếp. Ăn cùng cơm.",
    ],
  },
  {
    slug: "bun-tron-tom-thit",
    name: "Bún trộn tôm thịt",
    description: "Bún trộn tôm, thịt heo nạc, rau sống và đậu phộng, chan nước mắm chua ngọt.",
    meals: ["lunch"],
    cookMinutes: 25,
    ingredients: [
      ["Bún tươi", 180],
      ["Tôm", 100],
      ["Thịt heo nạc", 50],
      ["Dưa leo", 50],
      ["Giá đỗ", 50],
      ["Xà lách", 30],
      ["Đậu phộng", 10],
      ["Nước mắm", 15],
      ["Nước cốt chanh", 10],
    ],
    steps: [
      "Tôm và thịt heo luộc chín; tôm bóc vỏ, thịt thái mỏng.",
      "Rau rửa sạch, dưa leo thái sợi, giá trụng sơ.",
      "Pha nước mắm với nước cốt chanh và chút nước lọc.",
      "Cho bún, rau, tôm thịt vào tô, rưới nước mắm, rắc đậu phộng rang.",
    ],
  },

  // ===================== BỮA TỐI =====================
  {
    slug: "canh-dau-phu-ca-chua-com-gao-lut",
    name: "Canh đậu phụ cà chua, cơm gạo lứt",
    description: "Bát canh đậu phụ cà chua nóng hổi, nhẹ bụng cho buổi tối.",
    meals: ["dinner"],
    cookMinutes: 20,
    ingredients: [
      ["Đậu phụ", 150],
      ["Cà chua", 150],
      ["Hành lá", 10],
      ["Dầu ăn", 5],
      ["Nước mắm", 10],
      ["Cơm gạo lứt", 150],
    ],
    steps: [
      "Cà chua bổ múi, xào sơ với dầu.",
      "Thêm 500 ml nước, đun sôi.",
      "Đậu phụ cắt miếng nhỏ cho vào, nấu 5 phút, nêm nước mắm, rắc hành lá.",
      "Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "ca-ro-phi-hap-gung-khoai-lang",
    name: "Cá rô phi hấp gừng, cải thìa, khoai lang",
    description: "Cá hấp gừng hành giữ vị ngọt, ăn với cải thìa luộc và khoai lang thay cơm.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Cá rô phi", 150],
      ["Gừng", 10],
      ["Hành lá", 10],
      ["Dầu ăn", 5],
      ["Nước mắm", 10],
      ["Cải thìa", 200],
      ["Khoai lang", 200],
    ],
    steps: [
      "Khoai lang hấp 20 phút.",
      "Cá làm sạch, khứa vài đường, xếp gừng thái sợi lên trên, hấp 12–15 phút.",
      "Phi hành lá với dầu, rưới lên cá, chan thêm chút nước mắm.",
      "Cải thìa luộc chín, ăn cùng cá và khoai lang.",
    ],
  },
  {
    slug: "goi-uc-ga-rau-cu-khoai-lang",
    name: "Gỏi ức gà rau củ, khoai lang",
    description: "Gỏi ức gà trộn dưa leo, cà rốt, xà lách chua ngọt, rắc mè rang.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Ức gà", 150],
      ["Dưa leo", 100],
      ["Cà rốt", 50],
      ["Xà lách", 50],
      ["Hành tím", 10],
      ["Nước cốt chanh", 15],
      ["Nước mắm", 10],
      ["Mè", 5],
      ["Khoai lang", 150],
    ],
    steps: [
      "Ức gà luộc chín, xé nhỏ. Khoai lang hấp chín.",
      "Dưa leo, cà rốt thái sợi; xà lách cắt nhỏ; hành tím thái mỏng.",
      "Pha nước trộn từ nước cốt chanh và nước mắm.",
      "Trộn đều gà, rau và nước trộn, rắc mè rang. Ăn cùng khoai lang.",
    ],
  },
  {
    slug: "canh-bi-do-thit-bam-com-gao-lut",
    name: "Canh bí đỏ thịt bằm, cơm gạo lứt",
    description: "Canh bí đỏ nấu thịt heo nạc bằm, ngọt bùi dễ ăn.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Bí đỏ", 200],
      ["Thịt heo nạc", 100],
      ["Hành lá", 10],
      ["Nước mắm", 10],
      ["Cơm gạo lứt", 150],
    ],
    steps: [
      "Thịt heo băm nhỏ, ướp chút nước mắm.",
      "Đun sôi 500 ml nước, thả thịt vào, hớt bọt.",
      "Bí đỏ gọt vỏ, cắt miếng, cho vào nấu 10 phút đến khi mềm.",
      "Nêm nước mắm, rắc hành lá. Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "tom-rim-canh-mong-toi-com-gao-lut",
    name: "Tôm rim, canh mồng tơi, cơm gạo lứt",
    description: "Tôm rim tỏi đậm đà, canh mồng tơi mát, bữa tối nhiều đạm ít béo.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Tôm", 150],
      ["Hành tím", 10],
      ["Tỏi", 5],
      ["Dầu ăn", 5],
      ["Nước mắm", 15],
      ["Mồng tơi", 150],
      ["Cơm gạo lứt", 150],
    ],
    steps: [
      "Tôm rửa sạch, cắt râu. Phi hành tỏi với dầu, cho tôm vào đảo.",
      "Thêm nước mắm và chút nước, rim lửa nhỏ 8–10 phút.",
      "Mồng tơi nấu canh với 400 ml nước sôi khoảng 3 phút.",
      "Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "dau-phu-hap-nam-cai-thia",
    name: "Đậu phụ hấp nấm, cải thìa",
    description: "Đậu phụ hấp nấm rơm và gừng, ăn với cải thìa, nhẹ nhàng cho buổi tối.",
    meals: ["dinner"],
    cookMinutes: 20,
    ingredients: [
      ["Đậu phụ", 200],
      ["Nấm rơm", 100],
      ["Cải thìa", 150],
      ["Gừng", 5],
      ["Hành lá", 10],
      ["Nước mắm", 10],
      ["Dầu ăn", 5],
      ["Cơm gạo lứt", 120],
    ],
    steps: [
      "Đậu phụ cắt miếng dày, xếp vào đĩa; nấm bổ đôi xếp xung quanh.",
      "Rắc gừng thái sợi, rưới nước mắm, hấp 10 phút.",
      "Phi hành lá với dầu, rưới lên đậu.",
      "Cải thìa luộc chín. Dùng cùng cơm gạo lứt.",
    ],
  },
  {
    slug: "bo-xao-ca-chua-khoai-lang",
    name: "Bò nạc xào cà chua, khoai lang hấp",
    description: "Bò xào cà chua chua ngọt, ăn với khoai lang hấp thay cơm.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Thịt bò nạc", 120],
      ["Cà chua", 150],
      ["Tỏi", 5],
      ["Dầu ăn", 7],
      ["Hành lá", 10],
      ["Nước mắm", 5],
      ["Khoai lang", 150],
    ],
    steps: [
      "Khoai lang hấp 20 phút.",
      "Thịt bò thái mỏng, ướp tỏi và nước mắm.",
      "Xào bò lửa lớn 1–2 phút, gắp ra. Xào cà chua đến khi mềm.",
      "Cho bò vào đảo nhanh, rắc hành lá, tắt bếp. Ăn cùng khoai lang.",
    ],
  },
  {
    slug: "trung-hap-thit-dau-bap-luoc",
    name: "Trứng hấp thịt, đậu bắp luộc",
    description: "Trứng hấp thịt heo nạc mềm mịn, đậu bắp luộc, cơm gạo lứt.",
    meals: ["dinner"],
    cookMinutes: 25,
    ingredients: [
      ["Trứng gà", 100],
      ["Thịt heo nạc", 60],
      ["Hành lá", 10],
      ["Nước mắm", 5],
      ["Đậu bắp", 150],
      ["Cơm gạo lứt", 120],
    ],
    steps: [
      "Thịt heo băm nhỏ, trộn đều với trứng, hành lá và nước mắm.",
      "Đổ vào bát, hấp 15–20 phút đến khi chín.",
      "Đậu bắp luộc 4–5 phút.",
      "Dùng cùng cơm gạo lứt.",
    ],
  },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

// Chuyển 1 món sang tài liệu Sanity, tự tính dinh dưỡng từ số gram.
export function buildRecipeDocument(r: RecipeInput) {
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let servingGrams = 0;
  for (const [name, grams] of r.ingredients) {
    const n = NUTRITION[name];
    kcal += (n.kcal * grams) / 100;
    protein += (n.protein * grams) / 100;
    carbs += (n.carbs * grams) / 100;
    fat += (n.fat * grams) / 100;
    servingGrams += grams;
  }
  return {
    _id: `recipe-${r.slug}`,
    _type: "recipe",
    kind: "home",
    name: r.name,
    slug: { _type: "slug", current: r.slug },
    description: r.description,
    meals: r.meals,
    ingredients: r.ingredients.map(([name, grams], i) => ({
      _key: `ing${i + 1}`,
      _type: "ingredient",
      name,
      grams,
    })),
    servingGrams,
    calories: Math.round(kcal),
    protein: round1(protein),
    carbs: round1(carbs),
    fat: round1(fat),
    cookMinutes: r.cookMinutes,
    steps: r.steps,
  };
}

export const ALL_HOME_RECIPES: RecipeInput[] = [...RECIPES, ...MORE_RECIPES];
export const RECIPE_DOCUMENTS = ALL_HOME_RECIPES.map(buildRecipeDocument);

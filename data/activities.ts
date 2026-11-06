// Thư viện hoạt động: môn thể thao + bài tập. MET = mức tiêu hao năng lượng so với lúc ngồi yên
// (giá trị tham khảo theo Compendium of Physical Activities, mức "phong trào / vừa sức").
// Calo đốt thêm ước tính = (MET − 1) × cân nặng (kg) × số giờ (xem burnedCalories trong src/lib/workout-plan.ts).

export type ActivityKind = "sport" | "exercise";
export type ActivityPlace = "san" | "nha" | "ngoai-troi" | "ho-boi" | "phong-gym";

export type Activity = {
  key: string;
  name: string;
  kind: ActivityKind;
  place: ActivityPlace;
  met: number;
  tip: string; // 1–2 câu mẹo tập an toàn
  // Bài tập: tính theo số lần (reps) hoặc theo giây (giữ tư thế)
  unit?: "reps" | "seconds";
};

export const PLACE_LABEL: Record<ActivityPlace, string> = {
  san: "Sân",
  nha: "Tại nhà",
  "ngoai-troi": "Ngoài trời",
  "ho-boi": "Hồ bơi",
  "phong-gym": "Phòng gym",
};

export const ACTIVITIES: Activity[] = [
  // ---------- Môn thể thao ----------
  { key: "cau-long", name: "Cầu lông", kind: "sport", place: "san", met: 5.5, tip: "Khởi động kỹ cổ chân, cổ tay; mang giày đế bám sân." },
  { key: "pickleball", name: "Pickleball", kind: "sport", place: "san", met: 4.5, tip: "Môn nhẹ nhàng, dễ chơi cho người mới; chú ý bước chân ngắn, tránh lao người." },
  { key: "bong-da", name: "Bóng đá (đá phủi)", kind: "sport", place: "san", met: 7.0, tip: "Khởi động gối và đùi sau; uống nước giữa hiệp." },
  { key: "bong-chuyen", name: "Bóng chuyền", kind: "sport", place: "san", met: 4.0, tip: "Giữ ngón tay chụm khi chuyền bóng cao tay để tránh trật ngón." },
  { key: "bong-ro", name: "Bóng rổ", kind: "sport", place: "san", met: 6.5, tip: "Tiếp đất bằng hai chân, gối hơi chùng để bảo vệ khớp." },
  { key: "bong-ban", name: "Bóng bàn", kind: "sport", place: "nha", met: 4.0, tip: "Đứng thấp, gối hơi khuỵu; xoay hông khi vụt bóng." },
  { key: "tennis", name: "Tennis", kind: "sport", place: "san", met: 7.3, tip: "Học cầm vợt đúng từ đầu để tránh đau khuỷu tay." },
  { key: "boi", name: "Bơi lội", kind: "sport", place: "ho-boi", met: 6.0, tip: "Bơi chậm, đều hơi; nghỉ ở thành bể khi thấy mệt." },
  { key: "chay-bo", name: "Chạy bộ", kind: "sport", place: "ngoai-troi", met: 8.3, tip: "Chạy tốc độ vừa nói chuyện được; tăng quãng đường từ từ mỗi tuần." },
  { key: "dap-xe", name: "Đạp xe", kind: "sport", place: "ngoai-troi", met: 6.8, tip: "Chỉnh yên ngang hông; đội mũ bảo hiểm khi đi đường." },
  { key: "di-bo-nhanh", name: "Đi bộ nhanh", kind: "sport", place: "ngoai-troi", met: 4.3, tip: "Bước dài, vung tay tự nhiên; đi đến mức hơi thở nhanh nhưng vẫn nói được." },
  { key: "nhay-day", name: "Nhảy dây", kind: "sport", place: "nha", met: 10.0, tip: "Nhảy thấp bằng mũi chân; chia hiệp 1 phút nhảy – 1 phút nghỉ." },
  { key: "yoga", name: "Yoga", kind: "sport", place: "nha", met: 2.5, tip: "Thở đều, không cố gập quá sức; dùng thảm chống trượt." },
  { key: "aerobic", name: "Aerobic / khiêu vũ", kind: "sport", place: "nha", met: 6.5, tip: "Theo nhạc vừa phải; mang giày êm để giảm lực lên gối." },

  // ---------- Bài tập ----------
  { key: "squat", name: "Squat (ngồi xổm)", kind: "exercise", place: "nha", met: 5.0, unit: "reps", tip: "Đẩy hông ra sau như ngồi ghế, gối không vượt mũi chân." },
  { key: "hit-dat", name: "Hít đất", kind: "exercise", place: "nha", met: 3.8, unit: "reps", tip: "Người thẳng từ đầu đến gót; người mới có thể chống gối." },
  { key: "plank", name: "Plank", kind: "exercise", place: "nha", met: 3.8, unit: "seconds", tip: "Siết bụng, không võng lưng; thở đều khi giữ." },
  { key: "lunge", name: "Lunge (chùng chân)", kind: "exercise", place: "nha", met: 3.8, unit: "reps", tip: "Bước dài, gối sau gần chạm sàn; đổi chân luân phiên." },
  { key: "burpee", name: "Burpee", kind: "exercise", place: "nha", met: 8.0, unit: "reps", tip: "Bài nặng — người mới bỏ bước bật nhảy, làm chậm." },
  { key: "leo-nui", name: "Leo núi tại chỗ (mountain climber)", kind: "exercise", place: "nha", met: 8.0, unit: "seconds", tip: "Giữ hông thấp, kéo gối về ngực nhanh và đều." },
  { key: "cau-mong", name: "Cầu mông (glute bridge)", kind: "exercise", place: "nha", met: 3.5, unit: "reps", tip: "Nằm ngửa, đẩy hông lên đến khi thân thẳng, siết mông 1 giây." },
  { key: "gap-bung", name: "Gập bụng", kind: "exercise", place: "nha", met: 3.8, unit: "reps", tip: "Tay đặt nhẹ sau tai, không kéo cổ; nâng vai bằng cơ bụng." },
  { key: "bat-nhay", name: "Bật nhảy dang tay chân (jumping jack)", kind: "exercise", place: "nha", met: 8.0, unit: "seconds", tip: "Tiếp đất nhẹ bằng mũi chân; giảm tốc nếu đau gối." },
  { key: "superman", name: "Superman (nâng lưng)", kind: "exercise", place: "nha", met: 3.5, unit: "reps", tip: "Nằm sấp, nâng tay và chân cùng lúc, giữ 2 giây." },
  { key: "ta-tay", name: "Tạ tay / bình nước (cuốn tay)", kind: "exercise", place: "nha", met: 3.5, unit: "reps", tip: "Không có tạ thì dùng 2 chai nước 1,5 lít; khuỷu tay sát người." },
  { key: "gym-co-ban", name: "Tập gym cơ bản (máy / tạ)", kind: "exercise", place: "phong-gym", met: 5.0, unit: "reps", tip: "Nhờ huấn luyện viên chỉnh tư thế buổi đầu; bắt đầu với mức tạ nhẹ." },
  { key: "gian-co", name: "Giãn cơ toàn thân", kind: "exercise", place: "nha", met: 2.3, unit: "seconds", tip: "Giữ mỗi tư thế 20–30 giây, không nhún giật." },
];

export const ACTIVITY_BY_KEY = new Map(ACTIVITIES.map((a) => [a.key, a]));
export const SPORTS = ACTIVITIES.filter((a) => a.kind === "sport");

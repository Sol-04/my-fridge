// Nguồn ảnh thật của món ăn (đã tải lên Sanity, trường image.credit / license / sourceUrl).
// Chỉ dùng ảnh giấy phép mở: CC0, Public domain, CC BY, CC BY-SA. Thêm ảnh mới thì ghi thêm vào đây.
export type ImageCredit = { slug: string; file: string; credit: string; license: string; sourceUrl: string };

export const IMAGE_CREDITS: ImageCredit[] = [
  { slug: "pho-bo-tai", file: "Beef_pho.jpg", credit: "avlxyz", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Beef_pho.jpg" },
  { slug: "pho-ga", file: "Pho_ga_(noodle_soup_with_chicken),_Hanoi_(6945821707).jpg", credit: "David McKelvey from Brisbane, Australia", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pho_ga_%28noodle_soup_with_chicken%29%2C_Hanoi_%286945821707%29.jpg" },
  { slug: "bun-bo-hue", file: "Bún_bò_huê_close-up_-_Dakao_Hoang.jpg", credit: "Alpha from Melbourne, Australia", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_b%C3%B2_hu%C3%AA_close-up_-_Dakao_Hoang.jpg" },
  { slug: "bun-rieu-cua", file: "Bun_rieu_with_herbs.jpg", credit: "Enoki Mushroom", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bun_rieu_with_herbs.jpg" },
  { slug: "hu-tieu-nam-vang", file: "Hủ_tiếu_Nam_Vang.jpg", credit: "SauceSupreme", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang.jpg" },
  { slug: "chao-ga", file: "Cháo_gà_nhà_làm,_tháng_5_năm_2020_(1).jpg", credit: "Phương Huy", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ch%C3%A1o_g%C3%A0_nh%C3%A0_l%C3%A0m%2C_th%C3%A1ng_5_n%C4%83m_2020_%281%29.jpg" },
  { slug: "banh-mi-thit", file: "Banh_mi_sandwich.jpg", credit: "jeffreyw", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Banh_mi_sandwich.jpg" },
  { slug: "xoi-ga", file: "Xôi_gà.jpg", credit: "Yuichi Kosio", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:X%C3%B4i_g%C3%A0.jpg" },
  { slug: "banh-cuon", file: "Banh_cuon_nhan_thit.jpg", credit: "Mai Truong, aka Eistube at en.wikipedia", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Banh_cuon_nhan_thit.jpg" },
  { slug: "banh-bao-nhan-thit", file: "Bánh_bao.jpg", credit: "Baoothersks", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_bao.jpg" },
  { slug: "com-tam-suon", file: "Cơm_Tấm_Bì_Sườn_Chả.jpg", credit: "Charles Haynes", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:C%C6%A1m_T%E1%BA%A5m_B%C3%AC_S%C6%B0%E1%BB%9Dn_Ch%E1%BA%A3.jpg" },
  { slug: "com-ga-hai-nam", file: "Hainanese_chicken_rice.jpg", credit: "Misaochan", license: "CC BY 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hainanese_chicken_rice.jpg" },
  { slug: "bun-cha-ha-noi", file: "Bun-cha-hanoi.jpg", credit: "Valentin Orange", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bun-cha-hanoi.jpg" },
  { slug: "bun-thit-nuong", file: "Bun_thit_nuong.jpg", credit: "Lưu Ly", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bun_thit_nuong.jpg" },
  { slug: "banh-canh-cua", file: "Bánh_canh_cua.jpg", credit: "SauceSupreme", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_canh_cua.jpg" },
  { slug: "bo-kho-banh-mi", file: "Bánh_mì_bò_kho_ở_cà_phê_Nguyệt_Ca.jpg", credit: "Phương Huy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_m%C3%AC_b%C3%B2_kho_%E1%BB%9F_c%C3%A0_ph%C3%AA_Nguy%E1%BB%87t_Ca.jpg" },
  { slug: "banh-xeo", file: "Bánh_xèo.jpg", credit: "DuyTran16 at English Wikipedia", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%A1nh_x%C3%A8o.jpg" },
  { slug: "goi-cuon-tom-thit", file: "Gỏi_cuốn.jpg", credit: "Tran Hai Duong", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:G%E1%BB%8Fi_cu%E1%BB%91n.jpg" },
  { slug: "com-nam-ca-ngu", file: "Japanese_rice_balls_(onigiri).jpg", credit: "tednmiki", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Japanese_rice_balls_%28onigiri%29.jpg" },
  { slug: "canh-chua-ca-basa-com-gao-lut", file: "Canhchua1.jpg", credit: "stu_spivack", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Canhchua1.jpg" },
  { slug: "bun-ca", file: "Bún_Cá_Hà_Nội.jpg", credit: "Ron Diggity", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:B%C3%BAn_C%C3%A1_H%C3%A0_N%E1%BB%99i.jpg" },
  { slug: "pho-ga-it-banh", file: "Pho_ga_(noodle_soup_with_chicken),_Hanoi_(6945821707).jpg", credit: "David McKelvey from Brisbane, Australia", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pho_ga_%28noodle_soup_with_chicken%29%2C_Hanoi_%286945821707%29.jpg" },
];

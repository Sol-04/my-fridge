import Image from "next/image";

import { Icon, Icons } from "@/components/icons";
import { urlFor } from "@/sanity/lib/image";
import type { RecipeCardData } from "@/sanity/lib/recipes";

type Props = {
  image: RecipeCardData["image"];
  name: string;
  width: number; // chiều rộng ảnh tải về (px)
  sizes: string;
  preload?: boolean; // tải trước (dùng cho ảnh lớn đầu trang)
  eatOut?: boolean; // món ăn ngoài → icon cửa hàng thay cho nồi
};

// Ảnh món ăn tỉ lệ 16:10. Món chưa có ảnh sẽ hiện ô màu xanh nước nhạt với icon nồi.
export function RecipeImage({ image, name, width, sizes, preload, eatOut }: Props) {
  const height = Math.round((width * 10) / 16);

  if (!image) {
    return (
      <div
        className="flex aspect-[16/10] w-full items-center justify-center bg-aqua-50 text-aqua-800"
        role="img"
        aria-label={`${name} (chưa có ảnh)`}
      >
        <Icon icon={eatOut ? Icons.eatOut : Icons.dish} size={44} strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <Image
      src={urlFor(image).width(width).height(height).fit("crop").auto("format").url()}
      alt={image.alt || name}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      className="aspect-[16/10] w-full object-cover"
    />
  );
}

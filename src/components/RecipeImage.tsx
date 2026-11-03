import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";
import type { RecipeCardData } from "@/sanity/lib/recipes";

type Props = {
  image: RecipeCardData["image"];
  name: string;
  width: number; // chiều rộng ảnh tải về (px)
  sizes: string;
  preload?: boolean; // tải trước (dùng cho ảnh lớn đầu trang)
};

// Ảnh món ăn tỉ lệ 4:3. Món chưa có ảnh sẽ hiện ô màu nhạt với biểu tượng 🍲.
export function RecipeImage({ image, name, width, sizes, preload }: Props) {
  const height = Math.round((width * 3) / 4);

  if (!image) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center bg-emerald-50 text-5xl dark:bg-emerald-950"
        role="img"
        aria-label={`${name} (chưa có ảnh)`}
      >
        🍲
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
      className="aspect-[4/3] w-full object-cover"
    />
  );
}

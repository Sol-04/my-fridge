import Image from "next/image";

import { illustrationFor } from "@/lib/illustrations";
import { urlFor } from "@/sanity/lib/image";
import type { RecipeCardData } from "@/sanity/lib/recipes";

type Props = {
  image: RecipeCardData["image"];
  name: string;
  width: number; // chiều rộng ảnh tải về (px)
  sizes: string;
  preload?: boolean; // tải trước (dùng cho ảnh lớn đầu trang)
};

// Ảnh món ăn tỉ lệ 16:10. Món chưa có ảnh thật → hình vẽ minh hoạ theo loại món (có nhãn "Hình minh hoạ").
export function RecipeImage({ image, name, width, sizes, preload }: Props) {
  const height = Math.round((width * 10) / 16);

  if (!image) {
    return (
      <div className="relative">
        <Image
          src={illustrationFor(name)}
          alt={`Hình minh hoạ: ${name}`}
          width={320}
          height={200}
          sizes={sizes}
          preload={preload}
          unoptimized
          className="aspect-[16/10] w-full bg-aqua-50 object-cover"
        />
        <span className="absolute right-3 bottom-3 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-medium text-muted">
          Hình minh hoạ
        </span>
      </div>
    );
  }

  return (
    <Image
      src={urlFor(image).width(width).height(height).fit("crop").auto("format").url()}
      alt={image.alt || name}
      title={image.credit ? `Ảnh: ${image.credit}${image.license ? ` (${image.license})` : ""}` : undefined}
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      className="aspect-[16/10] w-full object-cover"
    />
  );
}

import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Tạo đường link ảnh từ dữ liệu ảnh Sanity, ví dụ: urlFor(mon.image).width(600).url()
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

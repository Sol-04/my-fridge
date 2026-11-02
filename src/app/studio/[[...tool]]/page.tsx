// Trang quản trị Sanity Studio tại /studio — dùng để thêm/sửa món ăn.
import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}

// Nhập 24 món ăn trong data/recipes.ts vào Sanity.
// Chạy:  npm run import:recipes
// Cần 3 biến môi trường (KHÔNG ghi giá trị vào file này):
//   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
// Chạy lại nhiều lần cũng không tạo món trùng (mỗi món có ID cố định, sẽ được ghi đè).
import { createClient } from "@sanity/client";

import { RECIPE_DOCUMENTS } from "../data/recipes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

const missing = [
  !projectId && "NEXT_PUBLIC_SANITY_PROJECT_ID",
  !dataset && "NEXT_PUBLIC_SANITY_DATASET",
  !token && "SANITY_API_WRITE_TOKEN",
].filter(Boolean);

if (missing.length > 0) {
  console.error(`❌ Thiếu biến môi trường: ${missing.join(", ")}`);
  console.error("   Hãy đặt chúng trong .env.local hoặc cài đặt môi trường rồi chạy lại.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-02-19",
  useCdn: false,
});

async function main() {
  console.log(`Đang nhập ${RECIPE_DOCUMENTS.length} món vào dataset "${dataset}"...`);
  const tx = client.transaction();
  for (const doc of RECIPE_DOCUMENTS) tx.createOrReplace(doc);
  await tx.commit();

  const count = await client.fetch<number>('count(*[_type == "recipe"])');
  console.log(`✅ Xong! Hiện có ${count} món ăn trong Sanity.`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("❌ Nhập thất bại:", message);
  process.exit(1);
});

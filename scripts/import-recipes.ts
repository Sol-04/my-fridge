// Nhập món ăn vào Sanity: món tự nấu (data/recipes.ts + data/recipes-more.ts) và món ăn ngoài (data/eatout.ts).
// Chạy:  npm run import:recipes
// Cần 3 biến môi trường (KHÔNG ghi giá trị vào file này):
//   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
// Chạy lại nhiều lần cũng không tạo món trùng (mỗi món có ID cố định, sẽ được ghi đè).
import { createClient } from "@sanity/client";

import { EATOUT_DOCUMENTS } from "../data/eatout";
import { RECIPE_DOCUMENTS } from "../data/recipes";

const DOCUMENTS: ({ _id: string; _type: string } & Record<string, unknown>)[] = [...RECIPE_DOCUMENTS, ...EATOUT_DOCUMENTS];
const BATCH_SIZE = 25; // gửi từng đợt cho nhẹ

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
  console.log(
    `Đang nhập ${DOCUMENTS.length} món (${RECIPE_DOCUMENTS.length} tự nấu, ${EATOUT_DOCUMENTS.length} ăn ngoài) vào dataset "${dataset}"...`,
  );
  for (let i = 0; i < DOCUMENTS.length; i += BATCH_SIZE) {
    const tx = client.transaction();
    for (const doc of DOCUMENTS.slice(i, i + BATCH_SIZE)) tx.createOrReplace(doc);
    await tx.commit();
    console.log(`  đã nhập ${Math.min(i + BATCH_SIZE, DOCUMENTS.length)}/${DOCUMENTS.length}`);
  }

  const count = await client.fetch<number>('count(*[_type == "recipe"])');
  console.log(`✅ Xong! Hiện có ${count} món ăn trong Sanity.`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("❌ Nhập thất bại:", message);
  process.exit(1);
});

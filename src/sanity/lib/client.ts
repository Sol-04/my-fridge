import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Client chỉ để ĐỌC dữ liệu công khai (không dùng token).
export const client = createClient({
  projectId: projectId || "missing-project-id",
  dataset,
  apiVersion,
  useCdn: true,
});

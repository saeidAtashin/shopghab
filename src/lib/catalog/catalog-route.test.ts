import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "@/app/api/admin/catalog/designs/route";

test("catalog route returns 401 without the admin cookie", async () => {
  const response = await GET(new Request("http://localhost/api/admin/catalog/designs"));
  assert.equal(response.status, 401);
});

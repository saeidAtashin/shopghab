import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "@/app/api/admin/catalog/designs/route";
import { GET as getMockupStatus } from "@/app/api/admin/catalog/mockups/route";
import { catalogErrorResponse } from "@/lib/catalog/http";

test("catalog route returns 401 without the admin cookie", async () => {
  const response = await GET(new Request("http://localhost/api/admin/catalog/designs"));
  assert.equal(response.status, 401);
});

test("mockup status route returns 401 without the admin cookie", async () => {
  const response = await getMockupStatus(new Request("http://localhost/api/admin/catalog/mockups"));
  assert.equal(response.status, 401);
  const body = (await response.json()) as { error?: string };
  assert.equal(body.error, "دسترسی غیرمجاز");
  assert.equal(JSON.stringify(body).includes("psd"), false);
});

test("catalog errors map filesystem locks to a clear Persian message", async () => {
  for (const code of ["EPERM", "EBUSY", "EACCES"] as const) {
    const response = catalogErrorResponse(Object.assign(new Error(code), { code }));
    assert.equal(response.status, 503);
    const body = (await response.json()) as { error?: string };
    assert.match(String(body.error), /OneDrive/);
  }
});

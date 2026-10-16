import assert from "node:assert/strict";
import test from "node:test";

import { findAdminPhone } from "./session";

function jwt(payload: object): string {
  return `h.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.s`;
}

test("findAdminPhone accepts the admin phone from the upstream body", () => {
  assert.equal(findAdminPhone({ data: { phone_number: "09368165125" } }), "09368165125");
});

test("findAdminPhone accepts the admin phone from the access token", () => {
  assert.equal(
    findAdminPhone({}, jwt({ phone_number: "+989368165125" })),
    "09368165125",
  );
});

test("findAdminPhone ignores a non-admin phone", () => {
  assert.equal(findAdminPhone({ data: { phone_number: "09120000000" } }), null);
});

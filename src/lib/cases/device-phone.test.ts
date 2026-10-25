import assert from "node:assert/strict";
import test from "node:test";

import {
  isPhoneVisitor,
  matchPhoneFromDevice,
  parseRememberedPhone,
  resolveSuggestedPhone,
} from "./device-phone";

const ANDROID_S24_ULTRA =
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

test("matchPhoneFromDevice maps a Galaxy S24 Ultra model code", () => {
  assert.deepEqual(
    matchPhoneFromDevice({
      userAgent: ANDROID_S24_ULTRA,
      screenWidth: 384,
      screenHeight: 832,
      devicePixelRatio: 3,
    }),
    { brandSlug: "samsung", modelSlug: "galaxy-s24-ultra" },
  );
});

test("matchPhoneFromDevice prefers the model code over a shorter marketing name", () => {
  assert.deepEqual(
    matchPhoneFromDevice({
      userAgent: `${ANDROID_S24_ULTRA} Galaxy S24`,
      modelName: "Galaxy S24",
      screenWidth: 384,
      screenHeight: 832,
      devicePixelRatio: 3,
    }),
    { brandSlug: "samsung", modelSlug: "galaxy-s24-ultra" },
  );
});

test("matchPhoneFromDevice matches Redmi Note 13 Pro without the plus variant", () => {
  assert.deepEqual(
    matchPhoneFromDevice({
      userAgent: "Mozilla/5.0 (Linux; Android 14; Redmi Note 13 Pro) AppleWebKit/537.36 Mobile",
      modelName: "Redmi Note 13 Pro",
      screenWidth: 393,
      screenHeight: 873,
      devicePixelRatio: 2.75,
    }),
    { brandSlug: "xiaomi", modelSlug: "redmi-note-13-pro" },
  );
});

test("matchPhoneFromDevice maps an iPhone screen bucket to the newest shared model", () => {
  assert.deepEqual(
    matchPhoneFromDevice({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      screenWidth: 393,
      screenHeight: 852,
      devicePixelRatio: 3,
    }),
    { brandSlug: "apple", modelSlug: "iphone-16" },
  );
});

test("resolveSuggestedPhone keeps a later choice ahead of the detected device", () => {
  const remembered = { brandSlug: "apple", modelSlug: "iphone-15" };
  const detected = { brandSlug: "samsung", modelSlug: "galaxy-s24-ultra" };
  assert.deepEqual(
    resolveSuggestedPhone({ isPhone: true, remembered, detected }),
    remembered,
  );
  assert.equal(
    resolveSuggestedPhone({ isPhone: false, remembered, detected }),
    null,
  );
});

test("parseRememberedPhone rejects an unknown model", () => {
  assert.equal(
    parseRememberedPhone(JSON.stringify({ brandSlug: "apple", modelSlug: "missing" })),
    null,
  );
  assert.deepEqual(
    parseRememberedPhone(JSON.stringify({ brandSlug: "apple", modelSlug: "iphone-15" })),
    { brandSlug: "apple", modelSlug: "iphone-15" },
  );
});

test("isPhoneVisitor accepts a narrow viewport and a phone user agent", () => {
  assert.equal(isPhoneVisitor("Mozilla/5.0 (Windows NT 10.0)", 1280), false);
  assert.equal(isPhoneVisitor("Mozilla/5.0 (Windows NT 10.0)", 390), true);
  assert.equal(isPhoneVisitor(ANDROID_S24_ULTRA, 1280), true);
});

import assert from "node:assert/strict";
import test from "node:test";

import { lockPageScroll } from "./scroll-lock";

function installDocument() {
  const html = { style: { overflow: "" } };
  const body = { style: { overflow: "auto", overscrollBehavior: "contain" } };
  const previous = globalThis.document;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: html, body },
  });
  return {
    html,
    body,
    restore() {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: previous,
      });
    },
  };
}

test("nested scroll locks restore the page only after the last unlock", () => {
  const page = installDocument();
  try {
    const unlockOuter = lockPageScroll();
    assert.equal(page.html.style.overflow, "hidden");
    assert.equal(page.body.style.overflow, "hidden");
    assert.equal(page.body.style.overscrollBehavior, "none");

    const unlockInner = lockPageScroll();
    unlockOuter();
    assert.equal(page.body.style.overflow, "hidden");

    unlockInner();
    assert.equal(page.html.style.overflow, "");
    assert.equal(page.body.style.overflow, "auto");
    assert.equal(page.body.style.overscrollBehavior, "contain");
  } finally {
    page.restore();
  }
});

test("releasing the same scroll lock twice does not unlock a later lock", () => {
  const page = installDocument();
  try {
    const unlockFirst = lockPageScroll();
    unlockFirst();
    unlockFirst();

    const unlockSecond = lockPageScroll();
    assert.equal(page.body.style.overflow, "hidden");
    unlockSecond();
    assert.equal(page.body.style.overflow, "auto");
  } finally {
    page.restore();
  }
});

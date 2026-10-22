import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server.js";
import { isAllowedWriteOrigin } from "../src/server/write-origin.ts";

const appOrigin = "http://127.0.0.1:3000";

test("accepts the configured browser origin after NextRequest normalizes loopback", () => {
  const request = new NextRequest(`${appOrigin}/api/documents`, { headers: { origin: appOrigin } });
  assert.equal(new URL(request.url).origin, "http://localhost:3000");
  assert.equal(isAllowedWriteOrigin(request, appOrigin), true);
});

test("rejects other origins and spoofed forwarded hosts", () => {
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:8080", "https://evil.example", "null"]) {
    const request = new Request(`${appOrigin}/api/documents`, {
      headers: { origin, "x-forwarded-host": "evil.example", host: "evil.example" },
    });
    assert.equal(isAllowedWriteOrigin(request, appOrigin), false);
  }
  assert.equal(isAllowedWriteOrigin(new Request(`${appOrigin}/api/documents`), appOrigin), true);
});

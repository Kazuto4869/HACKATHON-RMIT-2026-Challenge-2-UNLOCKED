import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:3000";

async function json(path, expected, options = {}) {
  const response = await fetch(new URL(path, base), options);
  assert.equal(response.status, expected, `${options.method ?? "GET"} ${path}`);
  const payload = await response.json();
  console.log(`PASS ${response.status} ${options.method ?? "GET"} ${path}`);
  return payload;
}

const listing = await json("/api/documents", 200);
assert.ok(Array.isArray(listing.documents) && listing.documents.length >= 4);
for (const document of listing.documents) assert.equal(Object.hasOwn(document, "body"), false);

for (const headers of [{}, { Authorization: "Bearer forged.token.value" }, { Cookie: "kcToken=forged.token.value" }]) {
  const denied = await json("/api/documents/patient-safety-brief", 401, { headers });
  assert.equal(Object.hasOwn(denied, "body"), false);
}
assert.equal(typeof (await json("/api/documents/sharing-charter", 200)).body, "string");
await json("/api/documents/unknown-document", 404);
await json("/api/documents?mine=1", 401);
await json("/api/documents", 401, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Unauthorized note", summary: "Not saved", body: "Not saved", isProtected: true }) });
await json("/api/access-requests", 401);
await json("/api/access-requests", 401, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: "patient-safety-brief" }) });

for (const path of ["/", "/notes/new", "/requests", "/guardians", "/account", "/auth/redirect", "/documents/patient-safety-brief"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal(html.includes("Synthetic protected"), false, `No protected seed content in ${path}`);
  console.log(`PASS 200 ${path}; protected seed body absent`);
}
const silent = await fetch(new URL("/silent-check-sso.html", base));
assert.equal(silent.status, 200);
console.log("PASS silent SSO page; smoke checks complete (no live Tide login/QEA assertion)");

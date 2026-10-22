import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createSqliteStore } from "../src/server/sqlite-store.ts";
import { createDocumentService } from "../src/server/document-service.ts";
import { createTideAuthorizationAdapter } from "../src/server/tide-authorization.ts";

test("notes and requests survive reopening without leaking bodies or crossing users", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "securedocs-test-"));
  const filename = join(directory, "test.sqlite");
  const first = createSqliteStore(filename);
  const note = await first.repository.createNote({ title: "Private plan", summary: "Safe summary", body: "SYNTHETIC_PRIVATE_BODY" }, "owner", true);
  const request = first.requests.create(note.id, "requester");
  first.close();
  const reopened = createSqliteStore(filename);
  context.after(() => {
    reopened.close();
    rmSync(directory, { recursive: true, force: true });
  });
  const metadata = await reopened.repository.listMetadata();
  assert.equal(metadata.length, 1);
  assert.equal(metadata[0].ownerId, "owner");
  assert.equal(JSON.stringify(metadata).includes("SYNTHETIC_PRIVATE_BODY"), false);
  assert.equal(Object.hasOwn(metadata[0], "body"), false);
  assert.deepEqual(reopened.requests.create(note.id, "requester"), request);
  assert.deepEqual(reopened.requests.list("another-person"), []);
  assert.equal(reopened.requests.list("requester").length, 1);
  const config = { realm: "test", "auth-server-url": "http://127.0.0.1/", resource: "client", "public-client": true, "confidential-port": 0, redirectUri: "http://127.0.0.1/auth/redirect", silentCheckSsoRedirectUri: "http://127.0.0.1/silent-check-sso.html" } as const;
  const adapter = createTideAuthorizationAdapter(config, async () => null);
  const service = createDocumentService(reopened.repository, adapter.canReadDocument);
  assert.equal((await service.readDocument(note.id, null)).kind, "unauthenticated");
  assert.equal((await service.readDocument(note.id, { subject: "requester", roles: [] })).kind, "forbidden");
  const ownRead = await service.readDocument(note.id, { subject: "owner", roles: [] });
  assert.equal(ownRead.kind, "readable");
  assert.equal(ownRead.kind === "readable" && ownRead.body, "SYNTHETIC_PRIVATE_BODY");
});

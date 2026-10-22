import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DatabaseSync } from "node:sqlite";

import { createAccessRequestStore } from "../src/server/access-request-store.ts";

describe("application access requests", () => {
  test("creates a PENDING request without granting document access", (context) => {
    const db = new DatabaseSync(":memory:");
    context.after(() => db.close());
    const store = createAccessRequestStore(db, () => "request-001");

    const request = store.create("patient-safety-brief", "requester-01");

    assert.deepEqual(request, {
      id: "request-001",
      documentId: "patient-safety-brief",
      requesterId: "requester-01",
      status: "PENDING",
      createdAt: request.createdAt,
    });
    assert.notEqual(request.status, "GRANTED");
    assert.ok(Number.isFinite(Date.parse(request.createdAt)));
  });

  test("returns the same pending request for duplicate submissions", (context) => {
    const db = new DatabaseSync(":memory:");
    context.after(() => db.close());
    let sequence = 0;
    const store = createAccessRequestStore(db, () => `request-${++sequence}`);

    const first = store.create("patient-safety-brief", "requester-01");
    const duplicate = store.create("patient-safety-brief", "requester-01");

    assert.deepEqual(duplicate, first);
    assert.equal(sequence, 1);
  });

  test("keeps requests separate by requester and document", (context) => {
    const db = new DatabaseSync(":memory:");
    context.after(() => db.close());
    let sequence = 0;
    const store = createAccessRequestStore(db, () => `request-${++sequence}`);

    store.create("patient-safety-brief", "requester-01");
    store.create("coastal-resilience-notes", "requester-01");
    store.create("patient-safety-brief", "requester-02");

    assert.equal(store.find("patient-safety-brief", "requester-01")?.id, "request-1");
    assert.equal(store.find("coastal-resilience-notes", "requester-01")?.id, "request-2");
    assert.equal(store.find("patient-safety-brief", "requester-02")?.id, "request-3");
    assert.equal(store.list("requester-01").length, 2);
    assert.equal(store.list("requester-02").length, 1);
    assert.deepEqual(store.list("unrelated-user"), []);
  });
});

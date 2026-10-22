import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createAccessRequestStore } from "../src/server/access-request-store.ts";

describe("application access requests", () => {
  test("creates a volatile PENDING request without granting document access", () => {
    const store = createAccessRequestStore(() => "request-001");

    const request = store.create("patient-safety-brief", "requester-01");

    assert.deepEqual(request, {
      id: "request-001",
      documentId: "patient-safety-brief",
      requesterId: "requester-01",
      status: "PENDING",
    });
    assert.notEqual(request.status, "GRANTED");
  });

  test("returns the same pending request for duplicate submissions", () => {
    let sequence = 0;
    const store = createAccessRequestStore(() => `request-${++sequence}`);

    const first = store.create("patient-safety-brief", "requester-01");
    const duplicate = store.create("patient-safety-brief", "requester-01");

    assert.deepEqual(duplicate, first);
    assert.equal(sequence, 1);
  });

  test("keeps requests separate by requester and document", () => {
    let sequence = 0;
    const store = createAccessRequestStore(() => `request-${++sequence}`);

    store.create("patient-safety-brief", "requester-01");
    store.create("coastal-resilience-notes", "requester-01");
    store.create("patient-safety-brief", "requester-02");

    assert.equal(store.find("patient-safety-brief", "requester-01")?.id, "request-1");
    assert.equal(store.find("coastal-resilience-notes", "requester-01")?.id, "request-2");
    assert.equal(store.find("patient-safety-brief", "requester-02")?.id, "request-3");
  });
});

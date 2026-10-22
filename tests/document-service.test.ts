import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createDocumentService,
  type DocumentRepository,
} from "../src/server/document-service.ts";
import type {
  DocumentMetadata,
  VerifiedViewer,
} from "../src/domain/documents.ts";

const locked: DocumentMetadata = {
  id: "patient-safety-brief",
  title: "Patient safety brief",
  summary: "Synthetic incident patterns prepared for controlled review.",
  ownerId: "Demo Health Lab",
  createdAt: "2026-10-19T09:30:00.000Z",
  isProtected: true,
  status: "RESTRICTED",
};

const publicDocument: DocumentMetadata = {
  id: "sharing-charter",
  title: "Responsible sharing charter",
  summary: "Public guidance for handling synthetic research notes.",
  ownerId: "SecureDocs Team",
  createdAt: "2026-10-18T04:15:00.000Z",
  isProtected: false,
  status: "PUBLIC",
};

function repository() {
  let bodyReads = 0;
  const documents = [locked, publicDocument];
  const bodies = new Map([
    [locked.id, "protected-body-must-never-leak"],
    [publicDocument.id, "This public charter contains synthetic guidance only."],
  ]);

  const value: DocumentRepository = {
    async listMetadata() {
      return documents.map((document) => ({
        ...document,
        body: bodies.get(document.id),
      })) as DocumentMetadata[];
    },
    async getMetadata(id) {
      return documents.find((document) => document.id === id) ?? null;
    },
    async getBody(id) {
      bodyReads += 1;
      return bodies.get(id) ?? null;
    },
  };

  return { value, bodyReads: () => bodyReads };
}

const viewer: VerifiedViewer = {
  subject: "requester-01",
  roles: [],
};

describe("document service boundary", () => {
  test("metadata listings remove body fields returned by a repository", async () => {
    const repo = repository();
    const service = createDocumentService(repo.value, async () => false);

    const documents = await service.listDocuments();

    assert.equal(documents.length, 2);
    assert.equal("body" in documents[0], false);
    assert.equal(JSON.stringify(documents).includes("protected-body-must-never-leak"), false);
  });

  test("an anonymous protected read is denied before the body store is touched", async () => {
    const repo = repository();
    const service = createDocumentService(repo.value, async () => false);

    const result = await service.readDocument(locked.id, null);

    assert.deepEqual(result, { kind: "unauthenticated", document: locked });
    assert.equal(repo.bodyReads(), 0);
  });

  test("an authenticated protected read is forbidden when policy denies", async () => {
    const repo = repository();
    const service = createDocumentService(repo.value, async () => false);

    const result = await service.readDocument(locked.id, viewer);

    assert.deepEqual(result, { kind: "forbidden", document: locked });
    assert.equal(repo.bodyReads(), 0);
  });

  test("the STEP 5 policy interface can authorize a protected read", async () => {
    const repo = repository();
    const service = createDocumentService(
      repo.value,
      async (candidate, document) =>
        candidate.subject === viewer.subject && document.id === locked.id,
    );

    const result = await service.readDocument(locked.id, viewer);

    assert.deepEqual(result, {
      kind: "readable",
      document: locked,
      body: "protected-body-must-never-leak",
    });
    assert.equal(repo.bodyReads(), 1);
  });

  test("public content is readable without an authenticated viewer", async () => {
    const repo = repository();
    const service = createDocumentService(repo.value, async () => false);

    const result = await service.readDocument(publicDocument.id, null);

    assert.deepEqual(result, {
      kind: "readable",
      document: publicDocument,
      body: "This public charter contains synthetic guidance only.",
    });
  });

  test("unknown document ids return not found without reading a body", async () => {
    const repo = repository();
    const service = createDocumentService(repo.value, async () => false);

    const result = await service.readDocument("missing", viewer);

    assert.deepEqual(result, { kind: "not-found" });
    assert.equal(repo.bodyReads(), 0);
  });
});

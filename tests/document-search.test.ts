import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { DocumentMetadata } from "../src/domain/documents.ts";
import { searchDocuments } from "../src/domain/search-documents.ts";

const documents: DocumentMetadata[] = [
  {
    id: "charter",
    title: "Responsible sharing charter",
    summary: "Public guidance for research notes.",
    ownerId: "Demo team",
    createdAt: "2026-10-18T04:15:00.000Z",
    isProtected: false,
    status: "PUBLIC",
  },
  {
    id: "safety",
    title: "Patient safety brief",
    summary: "Synthetic incident patterns.",
    ownerId: "Demo team",
    createdAt: "2026-10-19T09:30:00.000Z",
    isProtected: true,
    status: "RESTRICTED",
  },
];

describe("document search", () => {
  test("returns all metadata for a blank query", () => {
    assert.deepEqual(searchDocuments(documents, "  "), documents);
  });

  test("matches titles and summaries without using document bodies", () => {
    assert.deepEqual(searchDocuments(documents, "PATIENT").map(({ id }) => id), ["safety"]);
    assert.deepEqual(searchDocuments(documents, "research notes").map(({ id }) => id), ["charter"]);
    assert.deepEqual(searchDocuments(documents, "confidential body"), []);
  });
});

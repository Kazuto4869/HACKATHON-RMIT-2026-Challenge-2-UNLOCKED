import type { AccessRequest } from "../domain/documents.ts";
import type { DatabaseSync } from "node:sqlite";

export interface AccessRequestStore {
  create(documentId: string, requesterId: string): AccessRequest;
  find(documentId: string, requesterId: string): AccessRequest | null;
  list(requesterId: string): AccessRequest[];
  listForReview(): AccessRequest[];
}

export function createAccessRequestStore(
  database: DatabaseSync,
  createId: () => string = () => crypto.randomUUID(),
): AccessRequestStore {
  database.exec(`CREATE TABLE IF NOT EXISTS access_requests (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    requesterId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status = 'PENDING'),
    createdAt TEXT NOT NULL,
    UNIQUE (documentId, requesterId)
  )`);
  const find = (documentId: string, requesterId: string) =>
    database.prepare("SELECT * FROM access_requests WHERE documentId = ? AND requesterId = ?")
      .get(documentId, requesterId) as unknown as AccessRequest | undefined;

  return {
    create(documentId, requesterId) {
      const existing = find(documentId, requesterId);
      if (existing) return { ...existing };
      database.prepare("INSERT INTO access_requests (id, documentId, requesterId, createdAt) VALUES (?, ?, ?, ?) ON CONFLICT(documentId, requesterId) DO NOTHING")
        .run(createId(), documentId, requesterId, new Date().toISOString());
      return { ...find(documentId, requesterId)! };
    },
    find(documentId, requesterId) {
      const request = find(documentId, requesterId);
      return request ? { ...request } : null;
    },
    list(requesterId) {
      return (database.prepare("SELECT * FROM access_requests WHERE requesterId = ? ORDER BY createdAt DESC, id")
        .all(requesterId) as unknown as AccessRequest[]).map((request) => ({ ...request }));
    },
    listForReview() {
      return (database.prepare("SELECT * FROM access_requests ORDER BY createdAt DESC, id")
        .all() as unknown as AccessRequest[]).map((request) => ({ ...request }));
    },
  };
}

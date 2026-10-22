import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import type { DocumentMetadata } from "../domain/documents.ts";
import type { NoteInput } from "../domain/note-validation.ts";
import { createAccessRequestStore } from "./access-request-store.ts";

type DocumentRow = Omit<DocumentMetadata, "isProtected" | "status"> & { isProtected: number };
export type DocumentSeed = DocumentMetadata & { body: string };

function metadata(row: DocumentRow): DocumentMetadata {
  return {
    id: row.id, title: row.title, summary: row.summary, ownerId: row.ownerId,
    createdAt: row.createdAt, isProtected: Boolean(row.isProtected),
    status: row.isProtected ? "RESTRICTED" : "PUBLIC",
  };
}

const columns = "id, title, summary, ownerId, createdAt, isProtected";

export function createSqliteStore(filename: string, seeds: readonly DocumentSeed[] = []) {
  const database = new DatabaseSync(filename);
  database.exec("PRAGMA busy_timeout = 10000;");
  try {
    database.exec("PRAGMA journal_mode = WAL;");
  } catch {
    // Ignore if WAL mode is already active or locked by another worker
  }
  database.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL,
      ownerId TEXT NOT NULL, createdAt TEXT NOT NULL,
      isProtected INTEGER NOT NULL CHECK (isProtected IN (0, 1)), body TEXT NOT NULL
    )`);
  const insert = database.prepare(`INSERT OR IGNORE INTO documents
    (id, title, summary, ownerId, createdAt, isProtected, body) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  if (seeds.length > 0) {
    try {
      for (const seed of seeds) {
        insert.run(seed.id, seed.title, seed.summary, seed.ownerId, seed.createdAt, Number(seed.isProtected), seed.body);
      }
    } catch {
      // Ignore if concurrent worker already seeded
    }
  }

  const repository = {
    async listMetadata(): Promise<DocumentMetadata[]> {
      return (database.prepare(`SELECT ${columns} FROM documents ORDER BY createdAt DESC, id`)
        .all() as unknown as DocumentRow[]).map(metadata);
    },
    async getMetadata(id: string): Promise<DocumentMetadata | null> {
      const row = database.prepare(`SELECT ${columns} FROM documents WHERE id = ?`).get(id) as unknown as DocumentRow | undefined;
      return row ? metadata(row) : null;
    },
    async getBody(id: string): Promise<string | null> {
      const row = database.prepare("SELECT body FROM documents WHERE id = ?").get(id);
      return row ? String(row.body) : null;
    },
    async createNote(note: NoteInput, ownerId: string, isProtected: boolean): Promise<DocumentMetadata> {
      const document: DocumentMetadata = {
        id: randomUUID(), title: note.title, summary: note.summary,
        ownerId, createdAt: new Date().toISOString(), isProtected,
        status: isProtected ? "RESTRICTED" : "PUBLIC",
      };
      insert.run(document.id, document.title, document.summary, ownerId, document.createdAt, Number(isProtected), note.body);
      return document;
    },
  };

  return { repository, requests: createAccessRequestStore(database), close: () => database.close() };
}

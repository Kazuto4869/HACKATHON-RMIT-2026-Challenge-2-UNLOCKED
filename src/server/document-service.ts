import type {
  DocumentMetadata,
  DocumentReadResult,
  VerifiedViewer,
} from "../domain/documents.ts";

export interface DocumentRepository {
  listMetadata(): Promise<readonly DocumentMetadata[]>;
  getMetadata(id: string): Promise<DocumentMetadata | null>;
  getBody(id: string): Promise<string | null>;
}

export type CanReadDocument = (
  viewer: VerifiedViewer,
  document: DocumentMetadata,
) => Promise<boolean>;

function safeMetadata(document: DocumentMetadata): DocumentMetadata {
  return {
    id: document.id,
    title: document.title,
    summary: document.summary,
    ownerId: document.ownerId,
    createdAt: document.createdAt,
    isProtected: document.isProtected,
    status: document.status,
  };
}

export function createDocumentService(
  repository: DocumentRepository,
  canReadDocument: CanReadDocument,
) {
  return {
    async listDocuments(): Promise<DocumentMetadata[]> {
      return (await repository.listMetadata()).map(safeMetadata);
    },

    async readDocument(
      id: string,
      viewer: VerifiedViewer | null,
    ): Promise<DocumentReadResult> {
      const stored = await repository.getMetadata(id);
      if (!stored) return { kind: "not-found" };

      const document = safeMetadata(stored);
      if (document.isProtected) {
        if (!viewer) return { kind: "unauthenticated", document };
        if (!(await canReadDocument(viewer, document))) {
          return { kind: "forbidden", document };
        }
      }

      const body = await repository.getBody(document.id);
      return body === null
        ? { kind: "not-found" }
        : { kind: "readable", document, body };
    },
  };
}

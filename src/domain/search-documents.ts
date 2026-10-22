import type { DocumentMetadata } from "./documents.ts";

export function searchDocuments(
  documents: readonly DocumentMetadata[],
  query: string,
): readonly DocumentMetadata[] {
  const term = query.trim().toLowerCase();
  if (!term) return documents;

  return documents.filter((document) =>
    `${document.title} ${document.summary}`.toLowerCase().includes(term),
  );
}

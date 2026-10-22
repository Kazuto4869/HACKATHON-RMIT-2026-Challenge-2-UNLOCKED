import type { AccessRequest } from "../domain/documents.ts";

export interface AccessRequestStore {
  create(documentId: string, requesterId: string): AccessRequest;
  find(documentId: string, requesterId: string): AccessRequest | null;
}

export function createAccessRequestStore(
  createId: () => string = () => crypto.randomUUID(),
): AccessRequestStore {
  const requests = new Map<string, AccessRequest>();
  const key = (documentId: string, requesterId: string) => `${requesterId}\u0000${documentId}`;

  return {
    create(documentId, requesterId) {
      const requestKey = key(documentId, requesterId);
      const existing = requests.get(requestKey);
      if (existing) return existing;

      const request: AccessRequest = {
        id: createId(),
        documentId,
        requesterId,
        status: "PENDING",
      };
      requests.set(requestKey, request);
      return request;
    },
    find(documentId, requesterId) {
      return requests.get(key(documentId, requesterId)) ?? null;
    },
  };
}

export type DocumentStatus = "PUBLIC" | "RESTRICTED";

export interface DocumentMetadata {
  id: string;
  title: string;
  summary: string;
  ownerId: string;
  createdAt: string;
  isProtected: boolean;
  status: DocumentStatus;
}

export type AccessRequestStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "GRANTED"
  | "REJECTED";

export interface AccessRequest {
  id: string;
  documentId: string;
  requesterId: string;
  status: AccessRequestStatus;
}

export interface VerifiedViewer {
  subject: string;
  roles: readonly string[];
}

export type DocumentReadResult =
  | { kind: "readable"; document: DocumentMetadata; body: string }
  | { kind: "unauthenticated"; document: DocumentMetadata }
  | { kind: "forbidden"; document: DocumentMetadata }
  | { kind: "not-found" };

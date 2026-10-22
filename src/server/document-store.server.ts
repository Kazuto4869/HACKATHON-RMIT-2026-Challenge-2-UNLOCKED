import "server-only";

import type { DocumentMetadata } from "../domain/documents.ts";
import type { DocumentRepository } from "./document-service.ts";

const documents: readonly DocumentMetadata[] = [
  {
    id: "patient-safety-brief",
    title: "Patient safety brief",
    summary: "Synthetic incident patterns prepared for controlled review.",
    ownerId: "Demo Health Lab",
    createdAt: "2026-10-19T09:30:00.000Z",
    isProtected: true,
    status: "RESTRICTED",
  },
  {
    id: "coastal-resilience-notes",
    title: "Coastal resilience field notes",
    summary: "Fictional observations from a climate adaptation workshop.",
    ownerId: "Harbour Research Unit",
    createdAt: "2026-10-17T07:45:00.000Z",
    isProtected: true,
    status: "RESTRICTED",
  },
  {
    id: "funding-review-memo",
    title: "Funding review memo",
    summary: "Synthetic assessment notes for a demonstration grant panel.",
    ownerId: "Civic Futures Fund",
    createdAt: "2026-10-15T11:20:00.000Z",
    isProtected: true,
    status: "RESTRICTED",
  },
  {
    id: "sharing-charter",
    title: "Responsible sharing charter",
    summary: "Public guidance for handling synthetic research notes.",
    ownerId: "SecureDocs Team",
    createdAt: "2026-10-18T04:15:00.000Z",
    isProtected: false,
    status: "PUBLIC",
  },
];

const bodies = new Map<string, string>([
  [
    "patient-safety-brief",
    "Synthetic protected content for a future TideCloak-authorized demonstration.",
  ],
  [
    "coastal-resilience-notes",
    "Synthetic protected workshop observations. No real participants or locations are represented.",
  ],
  [
    "funding-review-memo",
    "Synthetic protected panel notes. No real applicant or funding decision is represented.",
  ],
  [
    "sharing-charter",
    "Use synthetic information for this prototype. Public metadata should help people understand a document without exposing its sensitive body. Protected content must be authorized on the server before it is read, and an application request must never be mistaken for a TideCloak permission grant.",
  ],
]);

export const documentRepository: DocumentRepository = {
  async listMetadata() {
    return documents;
  },
  async getMetadata(id) {
    return documents.find((document) => document.id === id) ?? null;
  },
  async getBody(id) {
    return bodies.get(id) ?? null;
  },
};

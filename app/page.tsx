import { DocumentLibrary } from "../components/document-library";
import { documentService, tideCloakConfigured } from "../src/server/documents.server";

type PageProps = { searchParams: Promise<{ q?: string | string[] }> };

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const documents = (await documentService.listDocuments()).map((document) => ({
    ...document, accessStatus: document.isProtected ? "LOCKED" as const : "AVAILABLE" as const,
  }));
  return <DocumentLibrary documents={documents} configured={tideCloakConfigured} initialQuery={query} />;
}

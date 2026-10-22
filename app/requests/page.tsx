import type { Metadata } from "next";
import { RequestList } from "../../components/request-list";
import { tideCloakConfigured } from "../../src/server/documents.server";

export const metadata: Metadata = { title: "Shared Requests" };

export default function SharedRequestsPage() {
  return <section className="space-y-7" aria-labelledby="requests-title">
    <h1 id="requests-title" className="text-2xl font-semibold tracking-tight">Shared Requests</h1>
    <RequestList configured={tideCloakConfigured} />
  </section>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowIcon, LockIcon, ShieldIcon } from "../../../components/icons";
import { ProtectedDocumentReader } from "../../../components/protected-document-reader";
import { StatusChip } from "../../../components/status-chip";
import { documentService } from "../../../src/server/documents.server";
import { loadTideCloakConfig } from "../../../src/server/tidecloak-config.server";
import { documentRoleFor } from "../../../src/server/tide-authorization";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await documentService.readDocument((await params).id, null);
  return result.kind === "not-found"
    ? { title: "Document not found" }
    : { title: result.document.title };
}

export default async function DocumentPage({ params }: PageProps) {
  const result = await documentService.readDocument((await params).id, null);
  if (result.kind === "not-found") notFound();

  const { document } = result;
  const readable = result.kind === "readable";
  const tideCloakConfigured = loadTideCloakConfig() !== null;

  return (
    <div className="detail-page">
      <Link className="back-link" href="/">
        <ArrowIcon /> Back to documents
      </Link>

      <section className="detail-heading">
        <div className={`detail-symbol ${readable ? "is-public" : "is-locked"}`}>
          {readable ? <ShieldIcon /> : <LockIcon />}
        </div>
        <div>
          <StatusChip tone={readable ? "public" : "locked"}>
            {readable ? "Public document" : "Restricted document"}
          </StatusChip>
          <h1>{document.title}</h1>
          <p>{document.summary}</p>
        </div>
      </section>

      <div className="detail-grid">
        <section className="reader-panel" aria-labelledby="reader-title">
          {readable ? (
            <>
              <div className="reader-heading">
                <span>Document content</span>
                <strong id="reader-title">Public reader</strong>
              </div>
              <p className="document-body">{result.body}</p>
            </>
          ) : <ProtectedDocumentReader documentId={document.id} configured={tideCloakConfigured} />}
        </section>

        <aside className="document-facts">
          <h2>Record details</h2>
          <dl>
            <div>
              <dt>Owner</dt>
              <dd>{document.ownerId}</dd>
            </div>
            <div>
              <dt>Access state</dt>
              <dd>{readable ? "Publicly readable" : "Server denied"}</dd>
            </div>
            <div>
              <dt>Authorization</dt>
              <dd>{readable ? "Not required" : documentRoleFor(document.id) ?? "Unmapped"}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>Synthetic only</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

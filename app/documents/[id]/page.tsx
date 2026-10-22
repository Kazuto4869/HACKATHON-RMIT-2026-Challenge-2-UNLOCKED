import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowIcon, LockIcon, ShieldIcon } from "../../../components/icons";
import { StatusChip } from "../../../components/status-chip";
import { documentService } from "../../../src/server/documents.server";

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
          ) : (
            <div className="locked-reader">
              <span className="locked-reader-icon">
                <LockIcon />
              </span>
              <p className="context-line">Content not delivered</p>
              <h2 id="reader-title">This document remains locked.</h2>
              <p>
                SecureDocs did not load the body from the server. A verified TideCloak
                identity and document-specific permission will be required in STEP 5.
              </p>
              <button className="button button-disabled" type="button" disabled>
                Request access · Available in STEP 5
              </button>
              <small>
                This control does not create an access request or simulate Guardian approval.
              </small>
            </div>
          )}
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
              <dd>{readable ? "Not required" : "TideCloak adapter pending"}</dd>
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

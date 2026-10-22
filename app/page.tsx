import Link from "next/link";

import { ArrowIcon, LockIcon, PlusIcon, ShieldIcon } from "../components/icons";
import { StatusChip } from "../components/status-chip";
import { documentService } from "../src/server/documents.server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const documents = await documentService.listDocuments();
  const protectedCount = documents.filter((document) => document.isProtected).length;

  return (
    <>
      <section className="dashboard-intro">
        <div>
          <p className="context-line">Document register · Synthetic demonstration</p>
          <h1>Sensitive notes, without silent access.</h1>
          <p className="intro-copy">
            Browse public-safe metadata now. Protected bodies stay on the server until a
            verified TideCloak policy permits the read.
          </p>
        </div>
        <div className="intro-actions">
          <Link className="button button-primary" href="/notes/new">
            <PlusIcon /> Create demo note
          </Link>
          <Link className="button button-secondary" href="/account">
            Check auth status
          </Link>
        </div>
      </section>

      <section className="boundary-banner" aria-label="Current security status">
        <span className="boundary-icon">
          <ShieldIcon />
        </span>
        <div>
          <strong>Deny-by-default is active</strong>
          <p>
            In-app TideCloak verification is not connected yet. Every protected body read
            is denied; STEP 5 will replace the authorization adapter with verified roles.
          </p>
        </div>
        <StatusChip tone="pending">STEP 5 pending</StatusChip>
      </section>

      <section className="register-section" aria-labelledby="register-title">
        <div className="section-heading">
          <div>
            <h2 id="register-title">Document register</h2>
            <p>{documents.length} synthetic records · {protectedCount} protected</p>
          </div>
          <span className="metadata-note">Listings contain metadata only</span>
        </div>

        <div className="document-register">
          {documents.map((document) => (
            <article className="document-row" key={document.id}>
              <div className={`document-symbol ${document.isProtected ? "is-locked" : "is-public"}`}>
                {document.isProtected ? <LockIcon /> : <ShieldIcon />}
              </div>
              <div className="document-copy">
                <div className="document-title-line">
                  <h3>{document.title}</h3>
                  <StatusChip tone={document.isProtected ? "locked" : "public"}>
                    {document.isProtected ? "Restricted" : "Public"}
                  </StatusChip>
                </div>
                <p>{document.summary}</p>
                <dl className="document-meta">
                  <div>
                    <dt>Owner</dt>
                    <dd>{document.ownerId}</dd>
                  </div>
                  <div>
                    <dt>Added</dt>
                    <dd>{formatDate(document.createdAt)}</dd>
                  </div>
                </dl>
              </div>
              <Link className="row-action" href={`/documents/${document.id}`}>
                {document.isProtected ? "View locked state" : "Read document"}
                <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

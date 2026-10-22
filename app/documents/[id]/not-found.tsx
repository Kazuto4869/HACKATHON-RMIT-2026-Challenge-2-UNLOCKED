import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <section className="empty-page">
      <p className="context-line">404 · Document register</p>
      <h1>Document not found.</h1>
      <p>The requested synthetic record does not exist.</p>
      <Link className="button button-primary" href="/">
        Return to documents
      </Link>
    </section>
  );
}

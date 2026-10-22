import Link from "next/link";

import { DocumentIcon, PlusIcon, ShieldIcon } from "./icons";
import { AuthControls } from "./auth-controls";

export function SiteHeader({ authConfigured }: { authConfigured: boolean }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SecureDocs document dashboard">
        <span className="brand-mark">
          <DocumentIcon />
        </span>
        <span>
          <strong>SecureDocs</strong>
          <small>Collective access, clearly governed</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/">Documents</Link>
        <Link href="/notes/new">
          <PlusIcon /> Create note
        </Link>
        <Link href="/account">
          <ShieldIcon /> Account status
        </Link>
        <AuthControls configured={authConfigured} />
      </nav>
    </header>
  );
}

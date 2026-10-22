# Shared layout


## app/layout.tsx

~~~tsx
import type { Metadata } from "next";

import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SecureDocs",
    template: "%s Â· SecureDocs",
  },
  description: "A deny-by-default document sharing prototype for TideCloak QEA integration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <SiteHeader />
          <main>{children}</main>
          <footer>
            <span>SecureDocs Â· STEP 4 prototype</span>
            <span>Synthetic data only</span>
          </footer>
        </div>
      </body>
    </html>
  );
}

~~~


## components/site-header.tsx

~~~tsx
import Link from "next/link";

import { DocumentIcon, PlusIcon, ShieldIcon } from "./icons";

export function SiteHeader() {
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
      </nav>
    </header>
  );
}

~~~


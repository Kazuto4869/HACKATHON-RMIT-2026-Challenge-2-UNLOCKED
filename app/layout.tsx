import type { Metadata } from "next";

import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SecureDocs",
    template: "%s · SecureDocs",
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
            <span>SecureDocs · STEP 4 prototype</span>
            <span>Synthetic data only</span>
          </footer>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import { SiteHeader } from "../components/site-header";
import { TideProvider } from "../components/tide-provider";
import { loadTideCloakConfig } from "../src/server/tidecloak-config.server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SecureDocs",
    template: "%s · SecureDocs",
  },
  description: "A deny-by-default document sharing prototype for TideCloak QEA integration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tideCloakConfig = loadTideCloakConfig();

  return (
    <html lang="en">
      <body>
        <TideProvider config={tideCloakConfig}>
          <div className="app-shell">
            <SiteHeader authConfigured={tideCloakConfig !== null} />
            <main>{children}</main>
            <footer>
              <span>SecureDocs · STEP 5 integration</span>
              <span>Synthetic data only</span>
            </footer>
          </div>
        </TideProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import { SiteHeader } from "../components/site-header";
import { TideProvider } from "../components/tide-provider";
import { loadTideCloakConfig } from "../src/server/tidecloak-config.server";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "SecureDocs",
    template: "%s | SecureDocs",
  },
  description: "Simple document sharing, protected by TideCloak.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = loadTideCloakConfig();
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <TideProvider config={config}>
        <div className="min-h-screen lg:flex">
          <SiteHeader authConfigured={config !== null} />
          <main className="min-w-0 flex-1 bg-white">
            <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
              {children}
            </div>
          </main>
        </div>
        </TideProvider>
      </body>
    </html>
  );
}

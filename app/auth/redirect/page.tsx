import Link from "next/link";

import { AuthRedirect } from "../../../components/auth-redirect";
import { loadTideCloakConfig } from "../../../src/server/tidecloak-config.server";

export default function RedirectPage() {
  if (!loadTideCloakConfig()) {
    return (
      <div className="empty-page">
        <p className="context-line">Authentication unavailable</p>
        <h1>The TideCloak adapter is not configured.</h1>
        <p>SecureDocs kept the session anonymous and did not attempt a protected read.</p>
        <Link className="button button-secondary" href="/account">View account status</Link>
      </div>
    );
  }
  return <AuthRedirect />;
}

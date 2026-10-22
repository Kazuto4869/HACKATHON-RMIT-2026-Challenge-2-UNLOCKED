import type { Metadata } from "next";
import Link from "next/link";

import { AccountAuthStatus } from "../../components/account-auth-status";
import { ArrowIcon, CheckIcon, LockIcon, ShieldIcon } from "../../components/icons";
import { StatusChip } from "../../components/status-chip";
import { loadTideCloakConfig } from "../../src/server/tidecloak-config.server";

export const metadata: Metadata = { title: "Account status" };

export default function AccountPage() {
  const configured = loadTideCloakConfig() !== null;

  return (
    <div className="account-page">
      <Link className="back-link" href="/">
        <ArrowIcon /> Back to documents
      </Link>
      <section className="page-heading">
        <p className="context-line">Authentication and governance status</p>
        <h1>Every protected read answers to TideCloak.</h1>
        <p>
          SecureDocs now uses the official SDK and verifies access tokens on the server.
          A live sign-in and the three-Guardian QEA grant still require the local realm.
        </p>
      </section>

      <section className="status-ledger" aria-labelledby="status-title">
        <div className="section-heading">
          <div>
            <h2 id="status-title">Integration ledger</h2>
            <p>Evidence-backed status for this checkout</p>
          </div>
          <StatusChip tone="pending">Live proof pending</StatusChip>
        </div>

        <div className="status-row">
          <span className="status-row-icon is-ready"><CheckIcon /></span>
          <div><strong>Local TideCloak realm</strong><p>`securedocs` verified in STEP 3.</p></div>
          <span>Verified</span>
        </div>
        <div className="status-row">
          <span className="status-row-icon is-ready"><CheckIcon /></span>
          <div><strong>Tide administrator</strong><p>One linked administrator and console session verified.</p></div>
          <span>Verified</span>
        </div>
        <AccountAuthStatus configured={configured} />
        <div className="status-row">
          <span className="status-row-icon is-pending"><LockIcon /></span>
          <div><strong>QEA document roles</strong><p>Three distinct Guardians and a real 2-of-3 document-role grant are not yet verified.</p></div>
          <span>Human action</span>
        </div>
      </section>

      <div className="account-actions">
        <a
          className="button button-secondary"
          href="http://127.0.0.1:8080/realms/securedocs/tide-console/"
          target="_blank"
          rel="noreferrer"
        >
          Open local Tide console
        </a>
        <p>Use the console for real role proposals and Guardian approvals; SecureDocs never approves them itself.</p>
      </div>
    </div>
  );
}

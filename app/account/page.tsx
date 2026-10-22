import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon, CheckIcon, LockIcon, ShieldIcon } from "../../components/icons";
import { StatusChip } from "../../components/status-chip";

export const metadata: Metadata = { title: "Account status" };

export default function AccountPage() {
  return (
    <div className="account-page">
      <Link className="back-link" href="/">
        <ArrowIcon /> Back to documents
      </Link>
      <section className="page-heading">
        <p className="context-line">Authentication readiness</p>
        <h1>TideCloak is ready outside the app.</h1>
        <p>
          STEP 3 verified the local realm and a Tide console session. This app has no client
          configuration or verified user session yet, so it treats every visitor as anonymous.
        </p>
      </section>

      <section className="status-ledger" aria-labelledby="status-title">
        <div className="section-heading">
          <div>
            <h2 id="status-title">Integration ledger</h2>
            <p>Evidence-backed status for this checkout</p>
          </div>
          <StatusChip tone="pending">Partial readiness</StatusChip>
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
        <div className="status-row">
          <span className="status-row-icon is-pending"><ShieldIcon /></span>
          <div><strong>Application sign-in</strong><p>No `tidecloak.json` or app session is installed in this checkout.</p></div>
          <span>STEP 5</span>
        </div>
        <div className="status-row">
          <span className="status-row-icon is-pending"><LockIcon /></span>
          <div><strong>QEA document roles</strong><p>Three Guardians and a 2-of-3 grant remain unconfigured and untested.</p></div>
          <span>STEP 5</span>
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
        <p>Only available while the verified local TideCloak container is running.</p>
      </div>
    </div>
  );
}

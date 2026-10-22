import type { Metadata } from "next";
import { ShieldCheck, UsersRound } from "lucide-react";

import { StatusChip } from "../../components/status-chip";
import { RequestList } from "../../components/request-list";
import { tideCloakConfigured } from "../../src/server/documents.server";

export const metadata: Metadata = { title: "Guardians" };

export default function GuardiansPage() {
  return (
    <section className="space-y-7" aria-labelledby="guardians-title">
      <header>
        <h1 id="guardians-title" className="text-2xl font-semibold tracking-tight text-slate-900">
          Guardians
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your shared access team</p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UsersRound aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Guardian setup</h2>
              <p className="mt-0.5 text-sm text-slate-500">Three administrators are planned.</p>
            </div>
          </div>
          <StatusChip tone="pending">Managed in TideCloak</StatusChip>
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-slate-900">Two approvals from three Guardians</p>
              <p className="mt-1 text-sm text-slate-500">Set up three distinct administrators and verify the quorum in TideCloak.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Review and approve permission changes in the TideCloak console. A request in this website does not grant access.
          </p>
        </div>

        <a
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-blue-600"
          href="http://127.0.0.1:8080/realms/securedocs/tide-console/"
          target="_blank"
          rel="noreferrer"
        >
          Open TideCloak
        </a>
      </div>
      <section aria-label="Guardian review queue" className="space-y-4">
        <h2 className="font-semibold">Requests to review</h2>
        <RequestList configured={tideCloakConfigured} guardian />
      </section>
    </section>
  );
}

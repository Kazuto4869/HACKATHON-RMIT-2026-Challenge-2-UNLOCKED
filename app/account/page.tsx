import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";

import { StatusChip } from "../../components/status-chip";
import { AccountAuthStatus } from "../../components/account-auth-status";
import { tideCloakConfigured } from "../../src/server/documents.server";

export const metadata: Metadata = { title: "Account status" };

export default function AccountPage() {
  const items = [
    { title: "Sign-in settings", detail: tideCloakConfigured ? "A public Tide adapter is loaded. Your session status appears below." : "The local Tide adapter still needs setup.", status: tideCloakConfigured ? "Loaded" : "Setup needed", icon: Check, ready: tideCloakConfigured },
    { title: "Guardian approvals", detail: "Managed in TideCloak. The live three-Guardian flow still needs verification.", status: "Not verified", icon: LockKeyhole, ready: false },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700" href="/">
        <ArrowRight className="size-4 rotate-180" /> Back to documents
      </Link>
      <header className="space-y-2">
        <p className="text-sm font-medium text-blue-700">Account status</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your setup is partly ready</h1>
        <p className="max-w-2xl text-slate-600">Check your sign-in and access setup.</p>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-6" aria-label="Setup status">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-semibold text-slate-900">Setup status</h2>
          <StatusChip tone="pending">In progress</StatusChip>
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map(({ title, detail, status, icon: Icon, ready }) => (
            <li key={title} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full ${ready ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <strong className="text-sm font-medium text-slate-900">{title}</strong>
                <p className="mt-0.5 text-sm text-slate-500">{detail}</p>
              </div>
              <span className="text-xs text-slate-500">{status}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-slate-100 pt-5"><AccountAuthStatus configured={tideCloakConfigured} /></div>
      </section>
      <a className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" href="http://127.0.0.1:8080/realms/securedocs/tide-console/" target="_blank" rel="noreferrer">
        Open TideCloak console
      </a>
    </div>
  );
}

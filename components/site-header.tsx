"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Inbox, ShieldCheck, UsersRound } from "lucide-react";
import { AuthControls } from "./auth-controls";

const navigation = [
  { href: "/", label: "My Documents", icon: FileText },
  { href: "/requests", label: "Shared Requests", icon: Inbox },
  { href: "/guardians", label: "Guardians", icon: UsersRound },
];

export function SiteHeader({ authConfigured }: { authConfigured: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
      <Link className="flex items-center gap-3 px-2" href="/" aria-label="SecureDocs home">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
          <FileText aria-hidden="true" className="size-5" />
        </span>
        <span className="text-base font-semibold tracking-tight text-slate-900">SecureDocs</span>
      </Link>

      <nav aria-label="Primary navigation" className="mt-4 flex gap-1 overflow-x-auto lg:mt-10 lg:flex-col">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/"
            ? pathname === "/" || pathname.startsWith("/documents/") || pathname.startsWith("/notes/")
            : pathname === href;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3 lg:mt-auto">
        <AuthControls configured={authConfigured} />
        <Link href="/account" className="block px-3 text-xs text-slate-500 hover:text-blue-700">Account status</Link>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
        <ShieldCheck aria-hidden="true" className="size-4 text-blue-600" />
        Protected by TideCloak
      </div>
      </div>
    </aside>
  );
}

"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { validateNoteInput, type NoteInput } from "../src/domain/note-validation";

const emptyNote: NoteInput = { title: "", summary: "", body: "" };
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export function NoteForm({ configured }: { configured: boolean }) {
  return configured ? <AuthenticatedNoteForm /> : <p className="empty-page">Sign-in setup is needed before creating a note.</p>;
}

function AuthenticatedNoteForm() {
  const { authenticated, isInitializing, initError, getToken, login } = useTideCloak();
  const router = useRouter();
  const [note, setNote] = useState<NoteInput>(emptyNote);
  const [errors, setErrors] = useState<Partial<Record<keyof NoteInput, string>>>({});
  const [isProtected, setProtected] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function update(field: keyof NoteInput, value: string) {
    setNote((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateNoteInput(note);
    if (!result.ok) { setErrors(result.errors); return; }
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) { setError("Your session expired. Sign in again."); return; }
      const response = await fetch("/api/documents", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...result.value, isProtected }) });
      const payload = await response.json() as { document?: { id: string }; errors?: typeof errors; error?: string };
      if (response.status === 201 && payload.document) {
        router.push(`/documents/${payload.document.id}`);
        router.refresh();
      } else {
        setErrors(payload.errors ?? {});
        setError(response.status === 401 ? "Your session expired. Sign in again." : payload.error ?? "Could not save the note. Your text is still here.");
      }
    } catch { setError("Could not save the note. Your text is still here."); }
    finally { setSaving(false); }
  }
  if (isInitializing) return <p role="status" className="empty-page">Checking your session…</p>;
  if (initError) return <p role="alert" className="empty-page">Sign-in is unavailable. Check Account status and try again.</p>;
  if (!authenticated) return <div className="empty-page space-y-4"><p>Sign in to create a note.</p><button className="button button-primary" onClick={() => void login().catch(() => setError("Sign-in failed. Try again."))}>Sign in</button>{error && <p role="alert">{error}</p>}</div>;
  return <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
    <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-6" onSubmit={(event) => void submit(event)} noValidate>
      {(["title", "summary", "body"] as const).map((field) => {
        const limit = field === "title" ? 80 : field === "summary" ? 180 : 2000;
        const common = { id: field, name: field, className: inputClass, value: note[field], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, event.target.value), "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${field}-error` : `${field}-help`, maxLength: limit + 1, disabled: saving };
        return <div className="space-y-2" key={field}>
          <div className="flex justify-between text-sm"><label className="font-medium" htmlFor={field}>{field === "summary" ? "Public-safe summary" : field === "body" ? "Note content" : "Title"}</label><span className="text-slate-500">{note[field].length}/{limit}</span></div>
          {field === "title" ? <input {...common} placeholder="Workshop debrief" /> : <textarea {...common} rows={field === "summary" ? 3 : 9} placeholder={field === "summary" ? "A short description without sensitive details" : "Use synthetic content only"} />}
          {errors[field] ? <p role="alert" id={`${field}-error`} className="text-sm text-red-600">{errors[field]}</p> : <p id={`${field}-help`} className="text-xs text-slate-500">{field === "summary" ? "Everyone can see the summary." : field === "body" ? "Do not enter real personal or confidential data." : "Keep it short and clear."}</p>}
        </div>;
      })}
      <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm"><input className="mt-1 accent-blue-600" type="checkbox" checked={isProtected} disabled={saving} onChange={(event) => setProtected(event.target.checked)} /><span><strong className="block font-medium">Protected note</strong><span className="text-slate-500">{isProtected ? "Only you and people granted access can read it." : "Public: everyone can read the full note."}</span></span></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save note"}</button>
    </form>
    <aside className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Before you share</h2><p className="text-sm leading-6 text-slate-500">Your note is saved on this server. Protected content requires sign-in and permission.</p><p className="text-xs leading-5 text-slate-500">Demo data only. End-to-end encryption is not enabled.</p></aside>
  </div>;
}

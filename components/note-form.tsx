"use client";

import { useState } from "react";

import {
  validateNoteInput,
  type NoteInput,
} from "../src/domain/note-validation";
import { CheckIcon } from "./icons";

const emptyNote: NoteInput = { title: "", summary: "", body: "" };

export function NoteForm() {
  const [note, setNote] = useState<NoteInput>(emptyNote);
  const [errors, setErrors] = useState<Partial<Record<keyof NoteInput, string>>>({});
  const [draft, setDraft] = useState<NoteInput | null>(null);

  function update(field: keyof NoteInput, value: string) {
    setNote((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateNoteInput(note);
    if (!result.ok) {
      setErrors(result.errors);
      setDraft(null);
      return;
    }

    setDraft(result.value);
    setNote(emptyNote);
    setErrors({});
  }

  return (
    <div className="note-workspace">
      <form className="note-form" onSubmit={submit} noValidate>
        <div className="field">
          <div className="field-heading">
            <label htmlFor="title">Title</label>
            <span>{note.title.length}/80</span>
          </div>
          <input
            id="title"
            name="title"
            value={note.title}
            onChange={(event) => update("title", event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            maxLength={81}
            placeholder="e.g. Workshop debrief"
          />
          {errors.title && (
            <p className="field-error" id="title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field">
          <div className="field-heading">
            <label htmlFor="summary">Public-safe summary</label>
            <span>{note.summary.length}/180</span>
          </div>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            value={note.summary}
            onChange={(event) => update("summary", event.target.value)}
            aria-invalid={Boolean(errors.summary)}
            aria-describedby={errors.summary ? "summary-error" : "summary-help"}
            maxLength={181}
            placeholder="Describe the note without revealing sensitive content."
          />
          {errors.summary ? (
            <p className="field-error" id="summary-error">
              {errors.summary}
            </p>
          ) : (
            <p className="field-help" id="summary-help">
              This summary would remain visible while a protected note is locked.
            </p>
          )}
        </div>

        <div className="field">
          <div className="field-heading">
            <label htmlFor="body">Note content</label>
            <span>{note.body.length}/2,000</span>
          </div>
          <textarea
            id="body"
            name="body"
            rows={9}
            value={note.body}
            onChange={(event) => update("body", event.target.value)}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "body-error" : "body-help"}
            maxLength={2001}
            placeholder="Use synthetic content only."
          />
          {errors.body ? (
            <p className="field-error" id="body-error">
              {errors.body}
            </p>
          ) : (
            <p className="field-help" id="body-help">
              Do not enter real personal, clinical, research, or confidential data.
            </p>
          )}
        </div>

        <button className="button button-primary" type="submit">
          Create demo draft
        </button>
      </form>

      <aside className="draft-panel" aria-live="polite">
        <div className="draft-panel-heading">
          <span>Current session</span>
          <strong>Demo draft</strong>
        </div>
        {draft ? (
          <div className="draft-result">
            <span className="success-mark">
              <CheckIcon /> Draft created
            </span>
            <h2>{draft.title}</h2>
            <p className="draft-summary">{draft.summary}</p>
            <div className="draft-body">{draft.body}</div>
            <p className="draft-warning">
              Stored only in page memory. Refreshing this page removes the draft.
            </p>
          </div>
        ) : (
          <div className="draft-empty">
            <span className="empty-rule" />
            <p>Your validated synthetic draft will appear here.</p>
            <small>No database, browser storage, or Tide encryption is used in STEP 4.</small>
          </div>
        )}
      </aside>
    </div>
  );
}

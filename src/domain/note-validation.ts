export interface NoteInput {
  title: string;
  summary: string;
  body: string;
}

export type NoteValidationResult =
  | { ok: true; value: NoteInput }
  | { ok: false; errors: Partial<Record<keyof NoteInput, string>> };

export function validateNoteInput(input: NoteInput): NoteValidationResult {
  const value = {
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
  };
  const errors: Partial<Record<keyof NoteInput, string>> = {};

  if (!value.title) errors.title = "Add a title.";
  else if (value.title.length > 80)
    errors.title = "Keep the title to 80 characters.";

  if (!value.summary) errors.summary = "Add a public-safe summary.";
  else if (value.summary.length > 180)
    errors.summary = "Keep the summary to 180 characters.";

  if (!value.body) errors.body = "Add note content.";
  else if (value.body.length > 2_000)
    errors.body = "Keep the note to 2,000 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

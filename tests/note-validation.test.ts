import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { validateNoteInput } from "../src/domain/note-validation.ts";

describe("demo note validation", () => {
  test("rejects blank required fields with actionable field errors", () => {
    const result = validateNoteInput({ title: "  ", summary: "", body: "\n" });

    assert.deepEqual(result, {
      ok: false,
      errors: {
        title: "Add a title.",
        summary: "Add a public-safe summary.",
        body: "Add note content.",
      },
    });
  });

  test("rejects content beyond the documented demo limits", () => {
    const result = validateNoteInput({
      title: "T".repeat(81),
      summary: "S".repeat(181),
      body: "B".repeat(2001),
    });

    assert.deepEqual(result, {
      ok: false,
      errors: {
        title: "Keep the title to 80 characters.",
        summary: "Keep the summary to 180 characters.",
        body: "Keep the note to 2,000 characters.",
      },
    });
  });

  test("normalizes a valid synthetic draft", () => {
    const result = validateNoteInput({
      title: "  Field interview outline  ",
      summary: "  Synthetic prompts for a demo session.  ",
      body: "  No real participant data.  ",
    });

    assert.deepEqual(result, {
      ok: true,
      value: {
        title: "Field interview outline",
        summary: "Synthetic prompts for a demo session.",
        body: "No real participant data.",
      },
    });
  });
});

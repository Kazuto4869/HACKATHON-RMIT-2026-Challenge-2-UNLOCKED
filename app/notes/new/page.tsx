import type { Metadata } from "next";
import Link from "next/link";

import { ArrowIcon } from "../../../components/icons";
import { NoteForm } from "../../../components/note-form";

export const metadata: Metadata = { title: "Create demo note" };

export default function CreateNotePage() {
  return (
    <div className="form-page">
      <Link className="back-link" href="/">
        <ArrowIcon /> Back to documents
      </Link>
      <section className="page-heading">
        <p className="context-line">Local demonstration · Not secure storage</p>
        <h1>Create a synthetic note.</h1>
        <p>
          Validate the note-writing journey without collecting real data. This STEP 4 draft
          exists only in page memory and is never sent to the document API.
        </p>
      </section>
      <NoteForm />
    </div>
  );
}

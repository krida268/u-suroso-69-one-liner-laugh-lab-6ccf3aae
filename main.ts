// One-Liner Laugh Lab — a program that writes one short funny line,
// the excuse a robot vacuum gives after eating a sock, to
// /output/entry.txt.
//
// The line is fixed on purpose: the entry is judged on the writing, so
// the program's job is to deliver exactly that line, byte for byte,
// on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this line, against the judge's brief:
// - It is the excuse a robot vacuum gives after eating a sock: the
//   vacuum answers for the missing sock in the first person.
// - It is funny on the first read: the vacuum never apologises, it
//   defends itself with its job description — the floor is its whole
//   jurisdiction — and then doubles down, it would do it again.
// - It is fresh: the joke is not "it was delicious" or "I thought it
//   was food", the two excuses anyone reaches for first; it is a small
//   machine hiding behind procedure and refusing to repent.
// - It fits the prompt: every word comes from the vacuum's job — the
//   floor, the cleaning, the doing of it — so the joke grows out of
//   the situation instead of being pasted onto it.
// - It is tight: three short sentences, no setup that overstays, the
//   punch landing in the last five words.
const LINE =
  "It was on the floor. My entire job is the floor. I did nothing wrong, and I would do it again.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate counts bytes, not characters: measure the line in UTF-8
  // bytes, since a character count would under-count any multi-byte
  // character and could let an over-long entry slip through. The gate
  // only accepts 1 to 200 bytes, so refuse loudly instead of shipping
  // a line the gate would throw away. It also refuses text that is
  // only white space, so check that too.
  const byteLength = Buffer.byteLength(LINE, "utf8");
  if (byteLength < 1 || byteLength > 200) {
    throw new Error(`entry must be 1-200 bytes, got ${byteLength}`);
  }
  if (LINE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // The entry must stand alone as one line: no line break anywhere
  // inside it, so a typo can never slip a second line past the gate.
  if (/[\r\n]/.test(LINE)) {
    throw new Error("entry must be a single line");
  }
  // One clean line means no tabs and no doubled spaces either: a
  // stray tab would read as a formatting glitch in front of the judge.
  if (/[\t]/.test(LINE) || /  /.test(LINE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // The gate counts every byte, so write exactly the line and nothing
  // else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, LINE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the one line: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server. Compare the
  // raw bytes, not just the decoded string: a decoding quirk could
  // hide a stray byte that the gate would still count.
  const written = readFileSync(OUT_FILE);
  if (!written.equals(Buffer.from(LINE, "utf8"))) {
    throw new Error("entry file does not hold exactly the one line");
  }
  console.log(`Wrote ${LINE.length} characters (${byteLength} bytes) to ${OUT_FILE}`);
}

main();

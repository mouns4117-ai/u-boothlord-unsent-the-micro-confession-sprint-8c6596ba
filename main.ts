import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Unsent: The Micro-Confession Sprint — a two-part micro-confession:
// a To: line naming who it was meant for, and the unsent message itself,
// written exactly as it was typed. No explanation after it.
const TO_LINE = "To: the barista who remembers my order";
const MESSAGE =
  "I almost asked for your number this morning, then I remembered I only come here when I'm sad, and I didn't want to be your sad regular.";

const ENTRY = `${TO_LINE}\n${MESSAGE}`;

// Fail fast: the gate is 1-260 UTF-8 characters for the whole entry,
// and the judge's brief caps the unsent message itself at 200 characters.
if (ENTRY.length < 1 || ENTRY.length > 260) {
  throw new Error(`entry is ${ENTRY.length} characters, outside the 1-260 gate`);
}
if (MESSAGE.length > 200) {
  throw new Error(`message line is ${MESSAGE.length} characters, over the 200 cap`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}
// The entry must be exactly two parts: a To: line and one message line.
const lines = ENTRY.split("\n");
if (lines.length !== 2 || !lines[0].startsWith("To: ")) {
  throw new Error("entry must be exactly a To: line plus one message line");
}

// Empty /output's CONTENTS only — /output is a mounted directory,
// removing the directory itself fails.
const OUT_DIR = "/output";
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
for (const name of readdirSync(OUT_DIR)) {
  rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
}

const OUT_PATH = `${OUT_DIR}/entry.txt`;
writeFileSync(OUT_PATH, ENTRY, "utf8");

// Read the copy back and confirm a byte-for-byte match before finishing.
const back = readFileSync(OUT_PATH, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: /output/entry.txt does not match the entry");
}
const hash = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`wrote ${OUT_PATH}: ${ENTRY.length} chars, sha256 ${hash}`);

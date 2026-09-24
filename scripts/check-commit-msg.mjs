#!/usr/bin/env node
import { readFileSync } from "node:fs";

const TYPES = [
  "feat",
  "fix",
  "spec",
  "docs",
  "test",
  "refactor",
  "style",
  "perf",
  "build",
  "ci",
  "chore",
  "revert",
];

const SUBJECT_LIMIT = 50;
const ITEM_ID = /^(FB-\d+|no-id)$/;
const HEADER = /^(?<type>[a-z]+)\((?<id>[^()]*)\): (?<subject>.*)$/;

const NON_IMPERATIVE = new Set([
  "added", "adds", "adding",
  "bumped", "bumps", "bumping",
  "changed", "changes", "changing",
  "created", "creates", "creating",
  "deleted", "deletes", "deleting",
  "fixed", "fixes", "fixing",
  "implemented", "implements", "implementing",
  "improved", "improves", "improving",
  "moved", "moves", "moving",
  "removed", "removes", "removing",
  "renamed", "renames", "renaming",
  "refactored", "refactors", "refactoring",
  "updated", "updates", "updating",
]);

function readMessage(path) {
  const raw = readFileSync(path, "utf8");
  const scissors = raw.indexOf("\n# ------------------------ >8");
  const body = scissors === -1 ? raw : raw.slice(0, scissors);
  return body
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trim();
}

function validate(message) {
  const errors = [];
  const lines = message.split(/\r?\n/);
  const header = lines[0] ?? "";

  if (/^(Merge|Revert) /.test(header) || /^(fixup|squash)! /.test(header)) {
    return errors;
  }

  if (lines.slice(1).some((line) => line.trim() !== "")) {
    errors.push("The message must be a single line. No body, no co-authored section.");
  }

  const match = HEADER.exec(header);
  if (!match) {
    errors.push("The message must match `<type>(<ITEM ID>): <subject>`.");
    return errors;
  }

  const { type, id, subject } = match.groups;

  if (!TYPES.includes(type)) {
    errors.push(`Unknown type \`${type}\`. Use one of: ${TYPES.join(", ")}.`);
  }

  if (!ITEM_ID.test(id)) {
    errors.push(`Invalid ITEM ID \`${id}\`. Use \`FB-<number>\` or \`no-id\`.`);
  }

  if (subject.length === 0) {
    errors.push("The subject must not be empty.");
    return errors;
  }

  if (subject.length > SUBJECT_LIMIT) {
    errors.push(`The subject is ${subject.length} characters. The limit is ${SUBJECT_LIMIT}.`);
  }

  if (/[.,;:!?]$/.test(subject)) {
    errors.push("The subject must not end with punctuation.");
  }

  if (/^[A-Z]/.test(subject)) {
    errors.push("The subject must start in lower case.");
  }

  const firstWord = subject.split(/\s+/)[0].toLowerCase();
  if (NON_IMPERATIVE.has(firstWord)) {
    const imperative = firstWord.replace(/(ed|ing|s)$/, "");
    errors.push(`Use the imperative mood. Write \`${imperative}\`, not \`${firstWord}\`.`);
  }

  return errors;
}

const [, , messagePath] = process.argv;
if (!messagePath) {
  console.error("Usage: node scripts/check-commit-msg.mjs <path-to-commit-message>");
  process.exit(2);
}

const message = readMessage(messagePath);
const errors = validate(message);

if (errors.length > 0) {
  console.error("\nInvalid commit message:\n");
  console.error(`  ${message.split(/\r?\n/)[0]}\n`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error("\nExpected format:\n");
  console.error("  <type>(<ITEM ID>): <subject>");
  console.error("  feat(FB-432): show summary in a sidebar");
  console.error("  spec(no-id): add bugfix track\n");
  console.error("See .github/copilot-instructions.md for the full convention.\n");
  process.exit(1);
}

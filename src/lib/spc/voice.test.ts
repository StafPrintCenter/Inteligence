import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanForSpeech } from "./voice";

test("retire titres, suggestions et code avant lecture", () => {
  const out = cleanForSpeech("[[titre: Devis]]**Bonjour**\n```js\nx=1\n```\n[[suggestion: A | B]]");
  assert.equal(out, "Bonjour Extrait de code omis.");
});

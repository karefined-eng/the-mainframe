import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRantTranscript, type ParsedRantResult } from "../src/engine/rantParser.ts";

test("parseRantTranscript decomposes a mixed voice rant into atomic domain cards", () => {
  const rant = `
    I had this crazy idea to jump out of a plane with a parachute when I visit the Swiss Alps next summer.
    Also, for work, I want to build an offline image viewer app with Tauri and React that starts up in under 50 milliseconds.
    And I really need to finish my deep learning certification on Coursera by next month.
    Oh, and today was super exhausting, felt like my brain was fried from debugging all afternoon.
    Finally, buy a 4K portable monitor under $300 so I can work while traveling.
  `;

  const result: ParsedRantResult = parseRantTranscript(rant);

  assert.ok(result.items.length >= 4, `Expected at least 4 items, got ${result.items.length}`);

  // 1. Experiences (Bucket list)
  const experience = result.items.find((i) => i.domain === "experiences");
  assert.ok(experience, "Should have detected an experience");
  assert.ok(experience?.title.toLowerCase().includes("plane") || experience?.title.toLowerCase().includes("parachute") || experience?.title.toLowerCase().includes("jump"));

  // 2. Build Ideas (Software)
  const build = result.items.find((i) => i.domain === "build_ideas");
  assert.ok(build, "Should have detected a build idea");
  assert.equal(build?.is_software_build, true);

  // 3. Certifications
  const cert = result.items.find((i) => i.domain === "certifications");
  assert.ok(cert, "Should have detected a certification");

  // 4. Journal / Reflection
  const journal = result.items.find((i) => i.domain === "journal");
  assert.ok(journal, "Should have detected a journal reflection");

  // 5. Acquisitions
  const acquisition = result.items.find((i) => i.domain === "acquisitions");
  assert.ok(acquisition, "Should have detected an acquisition");
});

test("parseRantTranscript preserves action triggers verbatim without truncation", () => {
  const rant = `
    I plan to review the quarterly revenue report every Monday at 8am in my home office when drinking coffee.
  `;

  const result = parseRantTranscript(rant);
  assert.ok(result.items.length > 0);
  const item = result.items[0];
  assert.ok(item.action_trigger, "Should extract action trigger");
  assert.ok(item.action_trigger.includes("Monday at 8am") || item.action_trigger.includes("drinking coffee"));
});

test("parseRantTranscript handles short or single thought rants safely", () => {
  const rant = "Just a quick thought about writing an essay on cognitive load theory.";
  const result = parseRantTranscript(rant);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].domain, "writing");
});

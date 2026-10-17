import { test } from "node:test";
import assert from "node:assert/strict";
import {
  exportCardAsOriginMd,
  exportCardAsMarkdown,
  exportCardAsText,
  type ExportableCard,
} from "../src/engine/exportEngine.ts";

test("exportCardAsOriginMd generates compliant origin.md with raw transcript anchor", () => {
  const item = {
    id: 1,
    title: "Eleviewer Desktop & Mobile",
    notes: "A unified cross-platform image viewer built with Tauri v2.",
    status: "in_progress" as const,
    created_at: "2026-10-17 12:00:00",
    updated_at: "2026-10-17 12:00:00",
    target_date: null,
    target_time: null,
    raw_import_text: "I want to build a super clean image viewer that runs on my phone and PC without cloud lag.",
  };

  const cards: ExportableCard[] = [
    { title: "Core Architecture", draft_content: "Rust backend with lightweight React canvas." },
    { title: "Defensible Moat", draft_content: "Instant offline launch under 25MB RAM." },
  ];

  const result = exportCardAsOriginMd(item, cards);

  assert.ok(result.includes("# Why I Started Eleviewer Desktop & Mobile"));
  assert.ok(result.includes("### The Raw Voice Memo (Verbatim Transcript)"));
  assert.ok(result.includes("I want to build a super clean image viewer"));
  assert.ok(result.includes("## Core Architecture"));
  assert.ok(result.includes("Rust backend with lightweight React canvas."));
});

test("exportCardAsMarkdown formats cards and meta cleanly", () => {
  const item = {
    id: 2,
    title: "Skydive over the Swiss Alps",
    notes: "Tandem jump from 14,000 feet.",
    status: "not_started" as const,
    created_at: "2026-10-17 12:00:00",
    updated_at: "2026-10-17 12:00:00",
    target_date: "2027-06-01",
    target_time: null,
    raw_import_text: null,
  };

  const result = exportCardAsMarkdown(item, []);

  assert.ok(result.includes("# Skydive over the Swiss Alps"));
  assert.ok(result.includes("**Status:** not_started"));
  assert.ok(result.includes("**Target Date:** 2027-06-01"));
  assert.ok(result.includes("Tandem jump from 14,000 feet."));
});

test("exportCardAsText produces dependency-free plain text", () => {
  const item = {
    id: 3,
    title: "Weekly Reflection",
    notes: "Focus was high on the parser engine.",
    status: "done" as const,
    created_at: "2026-10-17 12:00:00",
    updated_at: "2026-10-17 12:00:00",
    target_date: null,
    target_time: null,
    raw_import_text: null,
  };

  const cards: ExportableCard[] = [
    { title: "Wins", draft_content: "Completed unit tests." },
  ];

  const result = exportCardAsText(item, cards);

  assert.ok(result.includes("TITLE: Weekly Reflection"));
  assert.ok(result.includes("WINS:"));
  assert.ok(result.includes("Completed unit tests."));
});

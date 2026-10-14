# Product Context: The Mainframe

## 1. What is The Mainframe?
The Mainframe is a private, local-first personal operating system for solo builders, developers, and people with too many ideas. It unifies courses, goals, build ideas, ventures, and purchases in one private home without the blank-canvas maintenance of Notion or the overdue shame mechanics of Todoist.

## 2. Core Value Pillars
1. **Psychological Moat (Zero-Shame Neuro-UX):** Designed to reduce cognitive load and prevent avoidance freeze. The "What's Hot" attention queue is strictly capped at 3–5 items based on working memory limits. Stepping away for weeks produces calm re-entry facts—never red accusations or broken streaks.
2. **Structural Moat (5 Pre-modeled Domains):** 
   - *Courses & Certifications:* Ongoing study and skill paths.
   - *Build Ideas:* Software prototypes and execution-ready backlogs.
   - *Ventures:* Commercial milestones and business initiatives.
   - *Goals:* Target milestones with time-window scoring.
   - *Acquisitions:* Wishlist curation and spending justification.
3. **Ingestion Moat (3-Second Plaintext Capture):** Paste messy, unformatted text dumps directly from Apple Notes, WhatsApp, or Google Docs; each line becomes a structured card in the correct domain instantly. Original text preserved.
4. **Sovereignty Moat (Offline SQLite + P2P LAN/USB Sync):** Built on Tauri v2 (Rust) with a local SQLite database utilizing Write-Ahead Logging (WAL). Zero cloud servers, zero telemetry, zero accounts. Direct device-to-device synchronization over local Wi-Fi or wired USB (`adb reverse tcp:9377 tcp:9377`) using non-destructive differential merge.

## 3. Technology Stack
- **Native Core:** Tauri v2 with Rust
- **Frontend Interface:** React 19, TypeScript, Vite, Tailwind CSS
- **Database:** Local SQLite with WAL mode via `tauri-plugin-sql`
- **Peer-to-Peer Device Sync:** Rust HTTP/WebSocket differential merge daemon (port 9377)
- **Platforms:** Windows 10/11 (.exe, .msi), macOS (.dmg), Linux (.AppImage, .deb, .rpm), Android (.apk)

# The Mainframe

The Mainframe is a personal, local-first life-management system that consolidates everything currently scattered across separate lists, notes apps, and mental tracking into one unified dashboard.

It is purpose-built around fluid prioritization, not rigid scheduling, allowing you to track what matters across parallel tracks without forcing a single linear queue.

## Problem Statement
Most existing life management apps (Notion, generic to-do aggregators) are either too broad or too heavy. The Mainframe is purpose-built around five specific domains to fix the problem of having multiple lists scattered across phones and laptops with no single point of truth.

## The 5 Core Domains
1. **Studies/Certifications:** Online courses, platforms, progress.
2. **Build Ideas:** Dev projects, personal builds, "the core mainframe of things to pursue."
3. **Acquisitions:** Gear, apparel, and equipment to buy.
4. **Long-Term Goals:** Big picture, bucket-list items.
5. **Ventures:** Business ventures and client work.

## Core Features
- **Local-First & Private:** Data lives exclusively on your devices. No clouds, no servers, no subscriptions.
- **Cross-Platform:** Runs on Windows Desktop and Android.
- **Local Wi-Fi Sync:** Sync devices securely across your local network.
- **Plain-Text Ingestion:** Rapidly parse and import unstructured walls of text into structured rows.
- **Unified "What's Hot" View:** See the most urgent items across all five domains in one consolidated dashboard.

## Tech Stack
- **Framework:** [Tauri v2](https://v2.tauri.app/) (Rust backend)
- **Frontend:** React + Tailwind CSS + Lucide Icons
- **Database:** SQLite (via `tauri-plugin-sql`)
- **State Management:** React state/context (Redux-free)

## Development Setup

**Prerequisites:**
- Node.js (v18+)
- Rust (via rustup)
- Android Studio / Android SDK (for mobile builds)

**Running Locally:**
```bash
# Install dependencies
npm install

# Run desktop dev server
npm run tauri dev

# Run android dev server
npm run tauri android dev
```

**Note:** See the detailed `.md` files in the root directory for in-depth architectural and design decisions (`00_PROJECT_BRIEF.md`, `01_DATA_SCHEMA.md`, etc.).

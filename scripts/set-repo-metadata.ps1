#!/usr/bin/env pwsh
# set-repo-metadata.ps1
# Run once to configure GitHub repository metadata.
# Prerequisites: gh CLI authenticated (gh auth status) and network access to api.github.com

$repo = "karefined-eng/the-mainframe"

Write-Host "Configuring repository metadata for $repo..." -ForegroundColor Cyan

$description = "Local-first life management app. Track courses, goals, ideas, ventures and purchases - offline SQLite, no account, no cloud. Tauri v2 + Rust + React, desktop and Android."

gh repo edit $repo --description $description

Write-Host "  Description updated." -ForegroundColor Green

# Add topics (run individually - gh CLI does not support batch topic setting)
$topics = @(
    "local-first", "offline", "productivity", "life-management",
    "personal-dashboard", "sqlite", "tauri", "rust", "react",
    "typescript", "android", "cross-platform", "privacy",
    "self-hosted", "open-source"
)

foreach ($topic in $topics) {
    gh repo edit $repo --add-topic $topic
    Write-Host "  Topic added: $topic" -ForegroundColor Green
}

Write-Host "`nDone. Verify at: https://github.com/$repo" -ForegroundColor Cyan
Write-Host ""
Write-Host "MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host "  Upload public/landing/social-preview.jpg as the repository's Social Preview:" -ForegroundColor Yellow
Write-Host "  GitHub -> $repo -> Settings -> General -> Social preview -> Edit" -ForegroundColor Yellow

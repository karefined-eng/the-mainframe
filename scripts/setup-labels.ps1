#!/usr/bin/env pwsh
# setup-labels.ps1
# Run once after making the repository public to configure GitHub issue labels.
# Prerequisites: gh CLI authenticated (gh auth status)

$repo = "karefined-eng/the-mainframe"

Write-Host "Setting up GitHub labels for $repo..." -ForegroundColor Cyan

# Remove some defaults that don't fit this project
$remove = @("duplicate", "invalid", "question", "wontfix")
foreach ($label in $remove) {
    gh label delete $label --repo $repo --yes 2>$null
    Write-Host "  Removed: $label" -ForegroundColor DarkGray
}

# Create curated labels
$labels = @(
    @{ name = "bug"; color = "d73a4a"; description = "Confirmed bug" },
    @{ name = "enhancement"; color = "a2eeef"; description = "New feature or improvement" },
    @{ name = "good first issue"; color = "7057ff"; description = "Good for newcomers to the codebase" },
    @{ name = "help wanted"; color = "008672"; description = "Extra attention or expertise needed" },
    @{ name = "triage"; color = "ededed"; description = "Needs initial assessment" },
    @{ name = "platform: windows"; color = "0075ca"; description = "Windows desktop specific" },
    @{ name = "platform: macos"; color = "aaaaaa"; description = "macOS desktop specific" },
    @{ name = "platform: linux"; color = "ffd700"; description = "Linux desktop specific" },
    @{ name = "platform: android"; color = "3ddc84"; description = "Android specific" },
    @{ name = "sync"; color = "e4e669"; description = "LAN snapshot sync related" },
    @{ name = "ui/ux"; color = "d93f0b"; description = "User interface or experience" },
    @{ name = "docs"; color = "0075ca"; description = "Documentation only, no code change" },
    @{ name = "performance"; color = "ff9500"; description = "Performance or resource usage" },
    @{ name = "security"; color = "ee0701"; description = "Security related" }
)

foreach ($label in $labels) {
    gh label create $label.name `
        --color $label.color `
        --description $label.description `
        --repo $repo `
        --force
    Write-Host "  Created: $($label.name)" -ForegroundColor Green
}

Write-Host "`nDone. Labels configured for $repo." -ForegroundColor Cyan

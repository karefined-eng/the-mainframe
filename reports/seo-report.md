# SEO Audit Report

**URL:** [https://the-mainframe-app.vercel.app/](https://the-mainframe-app.vercel.app/)
**Date:** 15/10/2026, 7:32:07 am

## Overall Score

| Score | Rating |
|-------|--------|
| **97/100** :white_check_mark: | Excellent |

> :white_check_mark: **Audit passed** (score >= 70)

## Category Breakdown

| Category | Score | Passed | Warnings | Failed | Not measured |
|----------|-------|--------|----------|--------|--------------|
| Core | 100 :white_check_mark: | 24 | 0 | 0 | 0 |
| Technical SEO | 99 :white_check_mark: | 17 | 0 | 1 | 0 |
| Performance | 98 :white_check_mark: | 23 | 2 | 0 | 3 |
| Links | 98 :white_check_mark: | 17 | 2 | 0 | 8 |
| Images | 100 :white_check_mark: | 14 | 0 | 0 | 0 |
| Security | 94 :white_check_mark: | 23 | 2 | 1 | 0 |
| Crawlability | 99 :white_check_mark: | 20 | 1 | 0 | 16 |
| Structured Data | 90 :white_check_mark: | 12 | 3 | 0 | 3 |
| Accessibility | 96 :white_check_mark: | 32 | 3 | 0 | 0 |
| Content | 93 :white_check_mark: | 21 | 2 | 1 | 1 |
| Social | 83 :yellow_circle: | 6 | 3 | 0 | 0 |
| E\-E\-A\-T | 88 :yellow_circle: | 12 | 3 | 0 | 0 |
| URL Structure | 100 :white_check_mark: | 14 | 0 | 0 | 0 |
| Mobile | 100 :white_check_mark: | 7 | 0 | 0 | 5 |
| Internationalization | 100 :white_check_mark: | 12 | 0 | 0 | 1 |
| Legal Compliance | 100 :white_check_mark: | 1 | 0 | 0 | 0 |
| JavaScript Rendering | 100 :white_check_mark: | 16 | 0 | 0 | 0 |
| Redirects | 100 :white_check_mark: | 11 | 0 | 0 | 0 |
| HTML Validation | 100 :white_check_mark: | 11 | 0 | 0 | 0 |
| AI/GEO Readiness | 98 :white_check_mark: | 8 | 3 | 0 | 0 |

## :x: Failures

Found 3 failing checks, most important first:

### security\-csp\-xss

- **Category:** Security
- **Status:** :x: Failed
- **Message:** Content\-Security\-Policy does not effectively restrict scripts: script\-src allows 'unsafe\-inline' with no nonce or hash
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - url: `https://the\-mainframe\-app\.vercel\.app/`
  - reportOnly: `false`
  - scriptSrc: `\["'self'","'unsafe\-inline'","'unsafe\-eval'"\]`
  - critical: `\["script\-src allows 'unsafe\-inline' with no nonce or hash"\]`
  - advisory: `\["script\-src allows 'unsafe\-eval'","no base\-uri directive \(a <base> injection can redirect relati\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### content\-description\-pixel\-width

- **Category:** Content
- **Status:** :x: Failed
- **Message:** Meta description will be truncated in SERP: estimated 1072px \(max ~920px\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - description: `Private, local\-first personal operating system for courses, goals, and ventures\. 100% offline SQL\.\.\.`
  - estimatedWidth: `1072`
  - characterCount: `151`
  - thresholds: `\{"good":920,"warn":990\}`
  - impact: `Truncated descriptions lose the call\-to\-action and may reduce click\-through rates`
  - recommendation: `Shorten the description to fit within 920px \(~155 characters\)\. Place the most compelling informat\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### technical\-404\-page

- **Category:** Technical SEO
- **Status:** :x: Failed
- **Message:** Non\-existent page returned 200 instead of 404 \(soft 404 issue\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - testUrl: `https://the\-mainframe\-app\.vercel\.app/seo\-audit\-test\-nonexistent\-page\-2olt76l5t5f\-1792049518304`
  - statusCode: `200`
  - issue: `Soft 404 \- returns 200 for non\-existent pages`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

## :warning: Warnings

Found 24 warnings, most important first:

### schema\-required\-fields

- **Category:** Structured Data
- **Status:** :warning: Warning
- **Message:** All required fields present, but 3 recommended field\(s\) missing
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - typesChecked: `5`
  - totalMissingRequired: `0`
  - totalMissingRecommended: `3`
  - recommendations: `\["Organization: consider adding contactPoint, address","SoftwareApplication: consider adding aggr\.\.\.`
  - validations: `\[\{"type":"Organization","missingRequired":\[\],"missingRecommended":\["contactPoint","address"\]\},\{"t\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### perf\-asset\-cache\-policy

- **Category:** Performance
- **Status:** :warning: Warning
- **Message:** 8 of 8 static asset\(s\) lack an efficient cache policy: https://the\-mainframe\-app\.vercel\.app/assets/index\-B0T\_874V\.css \(max\-age=0s\), https://the\-mainframe\-app\.vercel\.app/assets/index\-CcG0M9bs\.js \(max\-age=0s\), https://the\-mainframe\-app\.vercel\.app/assets/inter\-latin\-400\-normal\-C38fXH4l\.woff2 \(max\-age=0s\), https://the\-mainframe\-app\.vercel\.app/assets/inter\-latin\-700\-normal\-Yt3aPRUw\.woff2 \(max\-age=0s\), https://the\-mainframe\-app\.vercel\.app/assets/inter\-latin\-500\-normal\-Cerq10X2\.woff2 \(max\-age=0s\), and 3 more
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - staticAssetCount: `8`
  - uncachedCount: `8`
  - thresholds: `\{"minMaxAgeSeconds":3600,"maxListed":5\}`
  - offenders: `\["https://the\-mainframe\-app\.vercel\.app/assets/index\-B0T\_874V\.css","https://the\-mainframe\-app\.verc\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### perf\-http2

- **Category:** Performance
- **Status:** :warning: Warning
- **Message:** No alt\-svc header found — server may not support HTTP/2 or HTTP/3 \(informational\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - altSvc: `not set`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### a11y\-skip\-link

- **Category:** Accessibility
- **Status:** :warning: Warning
- **Message:** No skip link found for keyboard navigation
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - hasMainLandmark: `true`
  - recommendation: `Add a skip link pointing to your <main> element`
  - example: `<a href="\#main" class="skip\-link">Skip to content</a>`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### a11y\-table\-headers

- **Category:** Accessibility
- **Status:** :warning: Warning
- **Message:** Found 2 table accessibility issue\(s\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - issues: `\[\{"table":"table\-1","issue":"4 header\(s\) missing scope attribute","rows":6,"cols":4\},\{"table":"ta\.\.\.`
  - dataTables: `1`
  - tablesWithHeaders: `1`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### schema\-entity\-id

- **Category:** Structured Data
- **Status:** :warning: Warning
- **Message:** Person missing @id
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - missing: `\["Person"\]`
  - relative: `\[\]`
  - recommendation: `Give each Organization, WebSite, and Person one absolute @id, such as https://example\.com/\#organi\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### schema\-organization

- **Category:** Structured Data
- **Status:** :warning: Warning
- **Message:** Organization schema valid with suggestions
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - orgCount: `1`
  - warnings: `\["consider adding contactPoint, address"\]`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### eeat\-author\-expertise

- **Category:** E\-E\-A\-T
- **Status:** :warning: Warning
- **Message:** Author found but no expertise indicators detected
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - signals: `\[\]`
  - credentials: `\[\]`
  - socialLinks: `\[\]`
  - recommendation: `Add author credentials, bio, and professional social links to establish expertise`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### eeat\-contact\-page

- **Category:** E\-E\-A\-T
- **Status:** :warning: Warning
- **Message:** No contact page or contact methods found \- important for trust
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - hasContactPage: `false`
  - contactMethods: `\[\]`
  - recommendation: `Add a contact page with multiple ways to reach you: email, phone, contact form, and physical address`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### security\-coop

- **Category:** Security
- **Status:** :warning: Warning
- **Message:** Missing Cross\-Origin\-Opener\-Policy header\. Pages that open this one keep a reference to its window\.
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - url: `https://the\-mainframe\-app\.vercel\.app/`
  - value: `null`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### a11y\-table\-caption

- **Category:** Accessibility
- **Status:** :warning: Warning
- **Message:** 1 of 1 data table\(s\) have caption problems
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - url: `https://the\-mainframe\-app\.vercel\.app/`
  - dataTables: `1`
  - issues: `\[\{"problem":"no\-caption","detail":"6x4 data table has no <caption>"\}\]`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### crawl\-sitemap\-date\-drift

- **Category:** Crawlability
- **Status:** :warning: Warning
- **Message:** Sitemap lastmod 2026\-10\-15 disagrees with schema dateModified 2026\-10\-14
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - modified: `2026\-10\-14`
  - lastmod: `2026\-10\-15`
  - recommendation: `Make lastmod and dateModified the same day, or stop publishing the one that is stale\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### eeat\-citations

- **Category:** E\-E\-A\-T
- **Status:** :warning: Warning
- **Message:** 5 external links found, but none to recognized authoritative sources
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - citationCount: `0`
  - externalLinkCount: `5`
  - hasCitationMarkup: `false`
  - hasReferencesSection: `false`
  - recommendation: `Consider linking to authoritative sources like \.gov, \.edu, or peer\-reviewed publications`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### security\-trusted\-types

- **Category:** Security
- **Status:** :warning: Warning
- **Message:** Content\-Security\-Policy does not set require\-trusted\-types\-for 'script', which would block DOM\-based XSS sinks\.
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - url: `https://the\-mainframe\-app\.vercel\.app/`
  - requiresTrustedTypes: `false`
  - hasTrustedTypesDirective: `false`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### content\-reading\-level

- **Category:** Content
- **Status:** :warning: Warning
- **Message:** Content may be too complex: 37\.3 \(Difficult \(college level\)\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - score: `37\.3`
  - levelDescription: `Difficult \(college level\)`
  - wordCount: `1044`
  - sentenceCount: `51`
  - avgWordsPerSentence: `20\.5`
  - thresholds: `\{"optimal":\{"min":60,"max":70\},"acceptable":\{"min":50,"max":80\}\}`
  - impact: `Complex content may alienate general audiences and reduce engagement`
  - recommendation: `Simplify language by: using shorter sentences, replacing jargon with common words, breaking long \.\.\.`
  - note: `Technical content for expert audiences may legitimately score lower\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### links\-dead\-end\-pages

- **Category:** Links
- **Status:** :warning: Warning
- **Message:** Page is a dead\-end with no outgoing internal links
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - internalLinkCount: `0`
  - recommendation: `Add navigation links, related content links, or breadcrumbs`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### links\-internal\-present

- **Category:** Links
- **Status:** :warning: Warning
- **Message:** No internal links found on this page
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - internalLinkCount: `0`
  - selfLinks: `12`
  - suggestion: `Add internal links to improve site navigation and help search engines crawl your site`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### content\-heading\-length

- **Category:** Content
- **Status:** :warning: Warning
- **Message:** Heading length issues: 1 too long \(>70 chars\)
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - headingCount: `20`
  - issueCount: `1`
  - tooShort: `0`
  - tooLong: `1`
  - issues: `\[\{"level":1,"text":"Your calm command center for everything you're learning, building, pursuing, \.\.\.`
  - minLength: `10`
  - maxLength: `70`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### geo\-agents\-md

- **Category:** AI/GEO Readiness
- **Status:** :warning: Warning
- **Message:** /AGENTS\.md returned an HTML document instead of the instructions file
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - path: `/AGENTS\.md`
  - recommendation: `Serve AGENTS\.md as text or Markdown, not the site HTML fallback\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### geo\-markdown\-response

- **Category:** AI/GEO Readiness
- **Status:** :warning: Warning
- **Message:** The origin does not serve a Markdown representation of /
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - recommendation: `Answer Accept: text/markdown for /, or publish /index\.md, so an agent can read the page without t\.\.\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### social\-og\-image\-size

- **Category:** Social
- **Status:** :warning: Warning
- **Message:** Missing og:image:width and og:image:height meta tags\. Add these with recommended size 1200x630
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - hasImage: `true`
  - ogImage: `https://the\-mainframe\-app\.vercel\.app/landing/social\-preview\.jpg`
  - hasDimensions: `false`
  - recommendedWidth: `1200`
  - recommendedHeight: `630`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### social\-profiles

- **Category:** Social
- **Status:** :warning: Warning
- **Message:** Only 1 social profile found \(GitHub\)\. Consider adding more for brand presence
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - hasProfiles: `true`
  - profileCount: `1`
  - profiles: `\[\{"platform":"GitHub","url":"https://github\.com/karefined\-eng"\}\]`
  - suggestion: `Add links to major platforms like Facebook, Twitter/X, Instagram, or LinkedIn`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### social\-share\-buttons

- **Category:** Social
- **Status:** :warning: Warning
- **Message:** No social sharing buttons detected\. Add share buttons to encourage social engagement
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - hasShareButtons: `false`
  - platformCount: `0`
  - suggestion: `Add share buttons for Facebook, Twitter/X, and LinkedIn`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

### geo\-well\-known

- **Category:** AI/GEO Readiness
- **Status:** :warning: Warning
- **Message:** No MCP or agent\-card manifest under \.well\-known
- **Page:** https://the\-mainframe\-app\.vercel\.app/
- **Details:**
  - found: `\[\]`
  - recommendation: `Publish /\.well\-known/mcp\.json or /\.well\-known/agent\-card\.json if agents should call this site\.`
  - pageUrl: `https://the\-mainframe\-app\.vercel\.app/`

## Summary

| Metric | Count |
|--------|-------|
| Total Checks | 328 |
| :white_check_mark: Passed | 301 |
| :warning: Warnings | 24 |
| :x: Failures | 3 |

---

*Generated by [SEOmator CLI](https://www.npmjs.com/package/@seomator/seo-audit)*
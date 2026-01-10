# Privacy Policy - Nobuco

**Last updated**: January 2026

## Data Collection

**This extension collects ZERO data.**

Specifically:
- No analytics
- No telemetry
- No user tracking
- No cookies
- No network requests
- No data sent to external servers
- No data stored remotely

## What the Extension Does

The extension:
1. Reads text content from posts on LinkedIn (locally in your browser)
2. Applies scoring heuristics (line breaks, length, emoji patterns)
3. Hides posts that match "silly writing" patterns
4. **All processing happens 100% locally in your browser**

## Permissions Explained

The extension requires **zero special permissions**.

It only needs:
- **Content script access to `linkedin.com/*`** - to read and hide posts on LinkedIn pages

The extension does NOT request:
- Access to your browsing history
- Access to your data on all websites
- Access to your downloads
- Access to your clipboard
- Network/fetch permissions

## Third-Party Services

**None.** This extension does not use any third-party services, APIs, or analytics platforms.

## Source Code

The complete source code is available for inspection. The extension consists of:
- `manifest.json` - extension configuration (~15 lines)
- `content.js` - filtering logic (~60 lines)

You can audit the code yourself before installation.

## Future Features

If we add support for other websites in the future:
- The extension will **ask for your permission** before accessing new sites
- You will see which sites are supported in the manifest
- The same privacy guarantees apply (100% local processing, zero data collection)

## Changes to This Policy

If we ever change how the extension handles data, we will:
1. Update this policy
2. Bump the version number
3. Notify users through the Chrome Web Store update notes

## Contact

Questions about privacy? Open an issue on the GitHub repository.

---

**TL;DR**: This extension reads LinkedIn posts in your browser and hides some of them. Nothing leaves your computer. Ever.

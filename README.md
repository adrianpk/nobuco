# Nobuco

> A privacy-first Chrome extension that filters LinkedIn posts based on writing style, not content.

Nobuco is your one-punch LinkedIn filter that knocks out spammy formatting.

## What it does

Filters out posts with infantilized writing patterns:
- Excessive line breaks
- One-liner formatting
- Emoji-heavy layouts
- Artificially short paragraphs

## What it does NOT do

- Does NOT send data to any server
- Does NOT collect analytics
- Does NOT read your messages, connections, or profile
- Does NOT filter by topic or keywords
- Does NOT modify LinkedIn's behavior outside your feed

## How it works

- **Reads** the text of posts visible in your LinkedIn feed
- **Scores** each post using local heuristics (line breaks, length, emojis)
- **Hides** posts that score above a threshold (default: 60%)
- **All processing happens in your browser** - zero network requests

## Privacy

- **100% local processing** - your data never leaves your browser
- **No permissions required** beyond reading LinkedIn pages
- **Open source** - inspect the code yourself (2 files, ~50 lines total)
- **No tracking, no telemetry, no external connections**

## Installation (local testing)

- Download or clone this repository
- Open Chrome → `chrome://extensions`
- Enable **Developer mode** (top-right toggle)
- Click **Load unpacked**
- Select the `nobuco` folder
- Visit LinkedIn and scroll your feed

## Configuration

Edit `content.js` to adjust:
- `THRESHOLD` (0.0 to 1.0) - sensitivity of filtering
- `RULES` - add/remove heuristic patterns

## Technical details

- **Manifest V3** - latest Chrome extension standard
- **No host permissions** - only matches LinkedIn URLs
- **MutationObserver** - handles LinkedIn's infinite scroll
- **Conservative failure mode** - if unsure, post stays visible

## Philosophy

This is not:
- Ad blocking
- Content moderation
- Censorship

This is:
- **Typographic noise reduction**
- **Format-based filtering** (not topic-based)
- **Your browser, your rules**

## Chrome Web Store Submission

This extension follows Chrome Web Store policies:
- **Single purpose**: Filter LinkedIn posts by writing style
- **Minimal permissions**: Zero special permissions required
- **No obfuscation**: All code is readable and auditable
- **Privacy-first**: No data collection whatsoever
- **Transparent**: Privacy policy included (see PRIVACY.md)

---

**Note**: LinkedIn's DOM structure changes regularly. If posts stop being filtered, check the browser console and update the selectors in `findPosts()` or `extractText()`.

## License

MIT - do whatever you want with it

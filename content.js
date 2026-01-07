/**
 * Nobuco - LinkedIn Feed Filter
 *
 * PURPOSE:
 * Filters LinkedIn posts based on writing style patterns (not content/topics).
 * Targets "infantilized" formatting: excessive line breaks, one-liners, emoji-heavy layouts.
 *
 * PRIVACY GUARANTEE:
 * - All processing happens locally in your browser
 * - ZERO network requests (check DevTools Network tab - you'll see nothing)
 * - ZERO data collection, analytics, or telemetry
 * - This script only: reads post text from DOM → scores it → hides element if needed
 * - Your data NEVER leaves your computer
 *
 * HOW IT WORKS:
 * 1. Find LinkedIn post elements in the DOM
 * 2. Extract text content from each post
 * 3. Score text using heuristics (line breaks, length, emojis)
 * 4. If score >= threshold, hide the post with CSS (display: none)
 * 5. Use MutationObserver to handle LinkedIn's infinite scroll
 *
 * TRANSPARENCY:
 * - Open source - audit this code yourself
 * - No obfuscation, no minification
 * - No permissions beyond reading LinkedIn pages
 * - Conservative failure mode: if unsure, post stays visible
 */

// --- Config ---
const THRESHOLD = 0.5; // Posts scoring >= 50% on heuristics get hidden (adjust 0.0-1.0)
const DEBUG = true;    // Set to false for production - logs filtering decisions to console

// --- Heuristic rules ---
const RULES = [
  t => (t.match(/\n/g) || []).length >= 4,                 // many line breaks
  t => t.length < 300,                                    // deceptively short length
  t => /\p{Extended_Pictographic}/u.test(t),              // contains emojis (modern form)
  t => t.split("\n").filter(l => l.trim().length < 60).length >= 5, // many short lines
  t => /(🔥|🚀|💯){2,}/u.test(t),                          // reinforcement: repeated emojis
  t => /^(Wild|Hot take|Unpopular opinion|Controversial|Real talk|Let that sink in|Mind[.\s]*blown|Unsettling|Shocking|Game[- ]changer|This changes everything)/i.test(t.trim()), // bait openers
  t => {
    // High whitespace-to-content ratio (lots of short dramatic lines)
    const lines = t.split("\n").filter(l => l.trim().length > 0);
    const veryShortLines = lines.filter(l => l.trim().length < 30).length;
    return lines.length > 10 && (veryShortLines / lines.length) > 0.5;
  },
  t => (t.match(/[→↳•✓✔✅❌]/g) || []).length >= 3,  // excessive decorative bullets/arrows (includes ↳)
];

// --- Scoring ---
function score(text) {
  const matches = RULES.filter(r => r(text)).length;
  return matches / RULES.length;
}

// --- DOM helpers ---
function findPosts() {
  // LinkedIn uses dynamic class names, so we target multiple selectors
  return document.querySelectorAll([
    'div.feed-shared-update-v2',
    'div[data-urn^="urn:li:activity"]',
    'div.feed-shared-update-v2__control-menu-container'
  ].join(', '));
}

function extractText(post) {
  // Try multiple selectors to find post text
  const selectors = [
    'span.break-words',
    'div.update-components-text',
    'div.update-components-update-v2__commentary',
    'div.feed-shared-inline-show-more-text'
  ];

  for (const selector of selectors) {
    const node = post.querySelector(selector);
    if (node && node.innerText) {
      return node.innerText;
    }
  }

  return "";
}

// --- Processing ---
function process() {
  findPosts().forEach(post => {
    // Skip already-processed posts
    if (post.dataset.sillyChecked) return;
    post.dataset.sillyChecked = "true";

    const text = extractText(post);
    if (!text) {
      if (DEBUG) console.log('[nobuco] No text extracted from post, skipping', post);
      return; // Conservative: if we can't read it, leave it visible
    }

    const postScore = score(text);
    const shouldHide = postScore >= THRESHOLD;

    if (DEBUG) {
      console.log('[nobuco] Post analysis:', {
        score: postScore.toFixed(2),
        threshold: THRESHOLD,
        action: shouldHide ? 'HIDDEN' : 'VISIBLE',
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        lineBreaks: (text.match(/\n/g) || []).length,
        length: text.length,
        hasEmojis: /\p{Extended_Pictographic}/u.test(text)
      });
    }

    // Hide only if score exceeds threshold
    if (shouldHide) {
      post.style.display = "none";
      post.dataset.nobucohidden = "true"; // Mark for debugging
    }
  });
}

// --- LinkedIn dynamic loading ---
const observer = new MutationObserver(process);
observer.observe(document.body, { childList: true, subtree: true });

// Initial pass
process();
